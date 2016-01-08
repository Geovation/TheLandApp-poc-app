(function() {
  'use strict';

  angular
    .module('LandApp')
    .service('mapService', mapService);

  /** @ngInject */
  function mapService(ol, $log, proj4, $mdToast, firebaseService) {
    // define EPSG:27700
    proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");

    // TODO: remove this hard code
    // var timsFarm = ol.proj.fromLonLat([-0.658493, 51.191286]);
    var jamesFarm = ol.proj.fromLonLat([-1.315305, 51.324901]);

    var osLayers = {};  // name: ol's layer
    var currentBaseMap = {};
    var view = {};
    var map = {};
    var drawingTools = [{
          name: 'Water',
          type: 'LineString',
          icon: 'fa-pencil',
          colour: "0, 178, 238",
          strokeWidth: 3
      }, {
          name: 'Electricity',
          type: 'LineString',
          icon: 'fa-bolt',
          colour: "238, 238, 0",
          strokeWidth: 3
      }, {
          name: 'Hedge',
          type: 'LineString',
          icon: 'fa-photo',
          colour: "46, 139, 87",
          strokeWidth: 3
      }, {
          name: 'Tree',
          type: 'Point',
          icon: 'fa-tree',
          colour: "46, 139, 87",
          strokeWidth: 3
      }, {
          name: 'Buildings',
          type: 'Polygon',
          icon: 'fa-industry',
          colour: "144, 78, 39",
          strokeWidth: 3
    }];

    var drawingLayers = {};

    var service = {
      createMap: createMap,
      setBaseMap: setBaseMap,
      fitExtent: fitExtent,
      toggleLayerFromCheckProperty: toggleLayerFromCheckProperty,
      zoomIn: zoomIn,
      zoomOut: zoomOut,
      toggleDrawingTool: toggleDrawingTool,
      drawingTools: drawingTools,
      deactivateAllDrawingTools: deactivateAllDrawingTools,
      isAnyDrawingToolActive: isAnyDrawingToolActive
    };

    return service;

    ///////////////
    function fitExtent(extent) {
      view.fit(extent, map.getSize());
    }

    function isAnyDrawingToolActive() {
      return drawingTools
        .filter(function(dt) { return dt.hasOwnProperty('draw');} )
        .length > 0;
    }

    function deactivateAllDrawingTools() {
      drawingTools
        .filter(function(dt) { return dt.hasOwnProperty('draw');} )
        .forEach(deactivateDrawingTool);
    }

    function newVectorLayer(name, colour, strokeWidth) {
      return new ol.layer.Vector({
        source: new ol.source.Vector({}),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: "rgba(" + colour +  ", 0.15)"
          }),
          stroke: new ol.style.Stroke({
            color: "rgba(" + colour +  ", 0.9)",
            width: strokeWidth
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: "rgba(" + colour +  ", 0.9)"
            })
          })
        })
      });
    }

    function unfocusLayer(layer) {
      map.getLayers().getArray()
        .filter(function(l) { return l !== layer; })
        .forEach(function(l) {
            l.setOpacity(l.oldOpacity || 1);
            delete l.oldOpacity;
        });
    }

    function focusLayer(layer) {
      map.getLayers().getArray()
        .filter(function(l) { return l !== layer; })
        .forEach(function(l) {
            l.oldOpacity = l.getOpacity();
            l.setOpacity(0.5);
        });
    }

    function toggleDrawingTool(tool) {
      if (tool.draw) {
        deactivateDrawingTool(tool);
      } else {
        activateDrawingTool(tool);
      }
    }

    function deactivateDrawingTool(tool) {
        $log.debug('deactivate', tool);

        var allFeatures = drawingLayers[tool.name].getSource().getFeatures();
        var format = new ol.format.GeoJSON();
        var jsonData = JSON.parse(format.writeFeatures(allFeatures));

        firebaseService.getUserLayersRef().child(tool.name).set(jsonData);
        tool.active = false;
        map.removeInteraction(tool.draw);
        delete tool.draw;
        unfocusLayer(drawingLayers[tool.name]);
    }

    function activateDrawingTool(tool) {
        $log.debug('activate', tool);
        tool.active = true;

        tool.draw = new ol.interaction.Draw({
            //features: this.$scope.drawingLayers[tool.name].getSource().getFeatures(),
            source: drawingLayers[tool.name].getSource(),
            type: tool.type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(" + tool.colour +  ", 0.15)"
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(" + tool.colour +  ", 0.9)",
                    width: tool.strokeWidth
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: "rgba(" + tool.colour +  ", 0.9)"
                    })
                })
            })
        });
        map.addInteraction(tool.draw);
        focusLayer(drawingLayers[tool.name]);
        $mdToast.show({
            template: '<md-toast>Start drawing some ' + tool.name + '!</md-toast>',
            hideDelay: 5000,
            position: "top right"
        });
    }

    function zoomIn() {
      view.setZoom(view.getZoom() + 1);
    }

    function zoomOut() {
      view.setZoom(view.getZoom() - 1);
    }

    function createMap() {
      view = new ol.View({
        center: jamesFarm,
        maxZoom: 20,
        minZoom: 7,
        zoom: 13
      });

      map = new ol.Map({
        target: 'map',
        layers: [],
        loadTilesWhileAnimating: true,
        view: view,
        controls: []
      });

      drawingLayers = drawingTools.reduce(function(obj, curr) {
        obj[curr.name] = newVectorLayer(curr.name, curr.colour, curr.strokeWidth);
        map.addLayer(obj[curr.name]);
        return obj;
      }, {});
    }

    function addLayer(layer) {
      buildAndCacheLayer(layer);
      map.addLayer(osLayers[layer.name]);
    }

    function removeLayer(layer) {
      buildAndCacheLayer(layer);
      map.removeLayer(osLayers[layer.name]);
    }

    function toggleLayerFromCheckProperty(layer) {
      if (layer.checked) {
        addLayer(layer);
      } else {
        removeLayer(layer);
      }
    }

    function buildAndCacheLayer(layer) {
      if (!osLayers[layer.name]) {
        switch (layer.type) {
          case 'base.mapbox':
            osLayers[layer.name] = new ol.layer.Tile({
              zIndex: -1,
              source: new ol.source.XYZ({
                url: layer.url
              })
            });
            break;
          case 'base.osm':
            osLayers[layer.name] = new ol.layer.Tile({
              zIndex: -1,
              source: new ol.source.OSM()
            });
            break;
          case 'base.mapquest':
            osLayers[layer.name] = new ol.layer.Tile({
              zIndex: -1,
              source: new ol.source.MapQuest({layer: 'osm'})
            });
            break;
          case 'vector':
            osLayers[layer.name] = new ol.layer.Vector({
              source: new ol.source.Vector({
                url: layer.url,
                format: new ol.format.GeoJSON({
                  defaultDataProjection: "EPSG:27700"
                })
              }),
              style: new ol.style.Style({
                fill: new ol.style.Fill({
                  color: layer.fillColor,
                }),
                stroke: new ol.style.Stroke({
                  color: layer.strokeColor,
                  width: 2
                })
              })
            });
            break;
          default:
            $log.debug("layer type '" + layer.type + "' not defined");
        }
      }
    } //buildAndCacheLayer

    function setBaseMap(baseMap) {
      removeLayer(currentBaseMap);
      currentBaseMap = baseMap;
      addLayer(currentBaseMap);
    }

  } // mapService

})();
