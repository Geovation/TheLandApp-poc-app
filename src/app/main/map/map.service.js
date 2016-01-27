(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('mapService', mapService);

  /** @ngInject */
  function mapService(ol, proj4, $log, $http, $mdToast, $rootScope, $timeout, $window,
      customLayersService, firebaseService, layerInteractionsService, layersService, olLayersService, tooltipMeasurementService) {

    // define EPSG:27700
    proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");

    // TODO: remove this hard code
    // var timsFarm = ol.proj.fromLonLat([-0.658493, 51.191286]);
    var jamesFarm = ol.proj.fromLonLat([-1.315305, 51.324901]);

    var currentBaseMap = {};
    var view = {};
    var map = {};
    var drawingLayers = layersService.drawingLayers;
    var enableDrawing = false;
    var mapInteractions = {};

    firebaseService.firebaseRef.onAuth(loadUserLayersAndEnableEditing);

    var service = {
      createMap: createMap,
      setBaseMap: setBaseMap,
      fitExtent: fitExtent,
      toggleLayerFromCheckProperty: toggleLayerFromCheckProperty,
      zoomIn: zoomIn,
      zoomOut: zoomOut,
      editToggleDrawingTool: editToggleDrawingTool,
      setVisibleDrawingToolLayer: setVisibleDrawingToolLayer,
      drawingLayers: drawingLayers,
      deactivateAllDrawingTools: deactivateAllDrawingTools,
      isAnyDrawingToolActive: isAnyDrawingToolActive,
      getEnableDrawing: function() {return enableDrawing;},
      removeFeature: removeFeature,
      saveDrawingLayers: saveDrawingLayers,
      getProjection: getProjection,
      getDrawingLayerDetailsByFeature: getDrawingLayerDetailsByFeature,
      addFeaturesToDrawingLayer: addFeaturesToDrawingLayer
    };

    return service;

    ///////////////
    function addFeaturesToDrawingLayer(drawingLayerName, features) {
      drawingLayers
        .find(function(layer){return layer.name === drawingLayerName;})
        .olLayer.getSource().addFeatures(features);
      saveDrawingLayers(drawingLayerName);
    }

    function loadUserLayersAndEnableEditing(authData) {
      if (authData) {
        firebaseService.getUserLayersRef().once("value", function(userLayers) {
          $log.debug(userLayers);

          var layers = userLayers.val();
          var format = new ol.format.GeoJSON();

          // populate drawingLayers with Open Layers vector layers.
          var vectorLayers = [];

          drawingLayers.forEach(function(layer){
            layer.olLayer = newVectorLayer(layer.name, layer.colour, layer.strokeWidth);
            vectorLayers.push(layer.olLayer);
            map.addLayer(layer.olLayer);

            if (layers && layers[layer.name] && layers[layer.name].features) {
              var features = format.readFeatures(layers[layer.name]);
              layer.olLayer.getSource().addFeatures(features);
            }
          });

          addControlInteractions(vectorLayers);

          fitExtent();
          $timeout(function() {enableDrawing = true;});
        });
      } else {
        enableDrawing = false;
      }
    }

    /** if extent is empty, calculate the extent based on user's layers.
    */
    function fitExtent(extent) {
      // Britisg extend
      // Latitude: 60.8433° to 49.9553°
      // Longitude: -8.17167° to 1.74944°

      // Easting: 64989
      // Northing: 1233616
      //
      // Easting: 669031
      // Northing: 12862

      if (!extent) {
        extent = ol.extent.createEmpty();

        angular.forEach(drawingLayers, function(layer) {
          ol.extent.extend(extent, layer.olLayer.getSource().getExtent());
        });
      }

      if (!ol.extent.isEmpty(extent)) {
        view.fit(extent, map.getSize());
      }
    }

    function isAnyDrawingToolActive() {
      return drawingLayers
        .filter(function(dt) { return dt.hasOwnProperty('draw');} )
        .length > 0;
    }

    function deactivateAllDrawingTools() {
      drawingLayers
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

    function editToggleDrawingTool(layer) {
      if (layer.draw) {
        deactivateDrawingTool(layer);
      } else {
        activateDrawingTool(layer);
      }
    }

    function deactivateDrawingTool(layer) {
        $log.debug('deactivate', layer);

        if (layer.active) {
          saveDrawingLayers(layer.name);

          layer.active = false;
          map.removeInteraction(layer.draw);
          delete layer.draw;
          unfocusLayer(layer.olLayer);
        }

        setVisibleDrawingToolLayer(layer);
    }

    /**
     * Saves the current drawing layers to the database.
     *
     * @param {string|undefined} singleLayerName If defined, will only save this named layer.
     */
    function saveDrawingLayers(singleLayerName) {
      var format = new ol.format.GeoJSON();

      angular.forEach(drawingLayers, function(layer, layerName) {
        if (angular.isDefined(singleLayerName) && (layerName !== singleLayerName)) {
          return;
        }

        var payload = angular.copy(format.writeFeaturesObject(layer.olLayer.getSource().getFeatures()));

        firebaseService.getUserLayersRef().child(layerName).set(payload);
      });
    }

    function activateDrawingTool(layer) {
        $log.debug('activate', layer);

        drawingLayers.forEach(function(dt){
          deactivateDrawingTool(dt);
        });

        layer.active = true;

        layer.draw = new ol.interaction.Draw({
            source: layer.olLayer.getSource(),
            type: layer.type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(" + layer.colour +  ", 0.15)"
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(" + layer.colour +  ", 0.9)",
                    width: layer.strokeWidth
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: "rgba(" + layer.colour +  ", 0.9)"
                    })
                })
            })
        });

        map.addInteraction(layer.draw);
        tooltipMeasurementService.addTooltip(layer.olLayer, layer.draw);

        focusLayer(layer.olLayer);
        $mdToast.show({
            template: '<md-toast>Start drawing some ' + layer.name + '!</md-toast>',
            hideDelay: 5000,
            position: "top right"
        });

        layer.olLayer.setVisible(true);
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

      // build and cache all layers
      angular.forEach(layersService, function(layers) {
        layers.forEach(function(layer){
          olLayersService.buildLayerAndInteractions(layer, service);
        });
      });

    }

    function getProjection() {
      return view.getProjection();
    }

    /**
     * Enables the following drawing layer interactions:
     *  - removing features (by clicking and pressing backspace)
     *  - modifying features (adding/moving attributes)
     */
    function addControlInteractions(vectorLayers) {
      mapInteractions.featureSelect = new ol.interaction.Select({
        condition: ol.events.condition.singleClick,
        toggleCondition: ol.events.condition.never,
        layers: vectorLayers,
        filter: function() {
          return !isAnyDrawingToolActive();
        }
      });

      mapInteractions.featureModify = new ol.interaction.Modify({
        features: mapInteractions.featureSelect.getFeatures()
      });

      mapInteractions.featureSelect.on("select", function(e) {
        $rootScope.$broadcast("toggle-feature-panel", e);
      });

      mapInteractions.featureModify.on("modifyend", function() {
        saveDrawingLayers();
      });

      map.addInteraction(mapInteractions.featureModify);
      map.addInteraction(mapInteractions.featureSelect);
    }

    function removeFeature(feature) {
      var layerDetails = getDrawingLayerDetailsByFeature(feature);

      if (layerDetails.layer) {
        layerDetails.layer.getSource().removeFeature(feature);
        saveDrawingLayers();
        clearSelectedFeatures();
      }
    }

    function getDrawingLayerDetailsByFeature(feature) {
      var layerDetails = {};

      drawingLayers.forEach(function(layer){
        if (layer.olLayer.getSource().getFeatures().indexOf(feature) > -1) {
          layerDetails.layer = layer.olLayer;
          layerDetails.name = layer.name;
          layerDetails.displayName = layer.displayName;
        }
      });

      return layerDetails;
    }

    function clearSelectedFeatures() {
      mapInteractions.featureSelect.getFeatures().clear();
    }

    function addLayer(layer) {
      map.addLayer(layer.olLayer);

      angular.forEach(layer.olMapInteractions, function(mapInteraction) {
        map.addInteraction(mapInteraction);
      });
    }

    function removeLayer(layer) {
      map.removeLayer(layer.olLayer);

      angular.forEach(layer.olMapInteractions, function(mapInteraction) {
        map.removeInteraction(mapInteraction);
      });
    }

    function toggleLayerFromCheckProperty(layer) {
      if (layer.checked) {
        addLayer(layer);
      } else {
        removeLayer(layer);
      }
    }

    function setBaseMap(baseMap) {
      removeLayer(currentBaseMap);
      currentBaseMap = baseMap;
      addLayer(currentBaseMap);
    }

    /** Hide/Unhide drawing tool layer based on tool being checked.
    */
    function setVisibleDrawingToolLayer(layer) {
      layer.olLayer.setVisible(layer.checked);
      clearSelectedFeatures();
    }

  } // mapService


})();
