(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olExternalLayerService', olExternalLayerService);

  /**
   * This service responsible of creating OpenLayers Layers and OpenLayers
   * Interactions and add them to the  "Land App" layer.
   */
  /** @ngInject */
  function olExternalLayerService(ol, $http, $log, $rootScope, $timeout, LAYERS_Z_INDEXES,
    olUserLayerService, onboardingService) {
    /* Each layer bust have a counter function called _addXXXLayer where XXX is
    /* the layer.type */
    var _addLayer = _buildAddLayerFunctions();
    var service = {
      addLayerAndInteractions: addLayerAndInteractions
    };

    return service;
    /////////////////////

    function addLayerAndInteractions(layer) {
      if (!layer.olLayer && layer.type) {
        var layerTypeCapitalized = layer.type.charAt(0).toUpperCase() + layer.type.slice(1);
        var buildFunctionName = "_add" + layerTypeCapitalized + "Layer";
        _addLayer[buildFunctionName](layer);
        $log.debug("created layer type '" + JSON.stringify(layer.type));
      }
    } // addLayerAndInteractions

    /////////////////////

    function _buildAddLayerFunctions() {
      return {
        _addBaseMapboxLayer: function (layer) {
          layer.olLayer = new ol.layer.Tile({
            zIndex: LAYERS_Z_INDEXES.baseMap,
            source: new ol.source.XYZ({
              url: layer.url,
              attributions: _makeAttribution("&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>")
            })
          });
        },

        _addWmsLayer: function(layer) {
          layer.olLayer = new ol.layer.Tile({
            zIndex: LAYERS_Z_INDEXES.external,
            source: new ol.source.TileWMS({
              url: layer.url,
              attributions: _makeAttribution(layer.attribution),
              params: {'LAYERS': layer.layers, 'TILED': true}
            })
          });
        },

        _addBaseOsmLayer: function(layer) { // jshint ignore:line
          layer.olLayer = new ol.layer.Tile({
            zIndex: LAYERS_Z_INDEXES.baseMap,
            source: new ol.source.OSM()
          });
        },

        _addXyzLayer: function(layer) { // jshint ignore:line
          layer.olLayer = new ol.layer.Tile({
            zIndex: LAYERS_Z_INDEXES.baseMap,
            source: new ol.source.XYZ({
                url: layer.url,
                attributions: _makeAttribution(layer.attribution)
              })
            });
        },

        _addVectorLayer: function(layer) { // jshint ignore:line
          layer.olLayer = new ol.layer.Vector({
            zIndex: LAYERS_Z_INDEXES.external,
            source: new ol.source.Vector({
              url: layer.url,
              attributions: _makeAttribution(layer.attribution),
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
        },

        _addVectorspaceLayer: function(layer) { // jshint ignore:line
          layer.olLayer = _buildVectorSpaceOlLayer(layer);
          layer.olMapInteractions = _buildVectorSpaceOlMapInteractions(layer);
        },

        _addBaseMapQuestLayer: function(layer) { // jshint ignore:line
          layer.olLayer = new ol.layer.Tile({
            zIndex: LAYERS_Z_INDEXES.baseMap,
            source: new ol.source.MapQuest({layer: 'osm'})
          });
        }
      };
    }


    function _makeAttribution(attributionHtml) { // jshint ignore:line
      return [new ol.Attribution({
        html: (attributionHtml || ('All maps &copy; <a href="https://geovation.uk/">Geovation</a>'))
      })];
    }

    function _buildVectorSpaceOlLayer(layer) { // jshint ignore:line
      var newLayer = new ol.layer.Vector({
        zIndex: LAYERS_Z_INDEXES.external,
        maxResolution: 5,
        source: new ol.source.Vector({
          attributions: [new ol.Attribution({
            html: 'LR © ' + '<a href="http://vectorspace.io/">VectorSpace</a>'
          })],
          format: new ol.format.GeoJSON(),
          strategy: ol.loadingstrategy.bbox,
          loader: function (extent, resolution, projection) {
            // wgs84
            extent = ol.proj.transformExtent(extent, "EPSG:3857", "EPSG:4326");

            $http.get(layer.url, {
              headers : {
                  "Accept": "application/json;srid=4326"
              },
              params : {
                "bbox" : extent.join() + ",4326"
              }
            })
            .then(function successCallback(response) {
              if (response.data) {
                var features = (new ol.format.GeoJSON())
                  .readFeatures(response.data, {
                      dataProjection: "EPSG:4326",
                      featureProjection: projection
                    });
                var src = newLayer.getSource();
                src.addFeatures(features);
                $log.debug('new featurecount:', src.getFeatures().length);
              }
            }, function errorCallback(response) {
              $log.debug(response);
            });
          }
        })
      });

      return newLayer;
    } // _buildVectorSpaceOlLayer

    function _buildVectorSpaceOlMapInteractions(layer) { // jshint ignore:line
      var click = new ol.interaction.Select({
        condition: function (e) {
          return ol.events.condition.click(e) && olUserLayerService.interactionsEnabled();
        },
        // multi select layers with single click only (no special key needed)
        // if clicking on a selected layer, it will deselect (and vice versa for deselected layers)
        toggleCondition: ol.events.condition.always,
        layers: [layer.olLayer]
      });

      click.on('select', function() {
        onboardingService.setSelectedLrFeatures(click.getFeatures());
      });

      return [click];
    }

  }
})();
