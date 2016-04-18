/**
 * @ngdoc service
 * @name  LandApp.service:olExternalLayerService
 * @description
 * Creates "external" layers, such as various base map and
 * Land Registry data sources. These layers cannot be modified
 * by the user, they are read and display only.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olExternalLayerService', olExternalLayerService);

  /** @ngInject */
  function olExternalLayerService(ol, $http, $log, $rootScope, $timeout, LAYERS_Z_INDEXES,
    olUserLayerService, onboardingService) {
    // each layer type must have a function called addXXXLayer,
    // where XXX === layer.type
    var _layerGenerators = _buildAddLayerFunctions();
    var service = {
      addLayerAndInteractions: addLayerAndInteractions
    };

    return service;

    ///////////////////// PUBLIC /////////////////////

    /**
     * @ngdoc method
     * @name  addLayerAndInteractions
     * @methodOf LandApp.service:olExternalLayerService
     * @description
     * Creates OpenLayers layers and interactions based on the
     * passed layer definition object. The generated layer
     * will be added to the layer definition object under
     * the olLayer property.
     *
     * @param {Object} layer Layer definition object
     */
    function addLayerAndInteractions(layer) {
      if (!layer.olLayer && layer.type) {
        var layerTypeCapitalized = layer.type.charAt(0).toUpperCase() + layer.type.slice(1);
        var buildFunctionName = "add" + layerTypeCapitalized + "Layer";
        _layerGenerators[buildFunctionName](layer);
        $log.debug("created layer type '" + JSON.stringify(layer.type));
      }
    }

    ///////////////////// PRIVATE /////////////////////

    /**
     * @ngdoc method
     * @name  _buildAddLayerFunctions
     * @methodOf LandApp.service:olExternalLayerService
     * @description
     * Returns an object literal containing a set of layer generators.
     */
    function _buildAddLayerFunctions() {
      return {
        addBaseMapboxLayer: addBaseMapboxLayer,
        addWmsLayer: addWmsLayer,
        addBaseOsmLayer: addBaseOsmLayer,
        addXyzLayer: addXyzLayer,
        addVectorLayer: addVectorLayer,
        addVectorspaceLayer: addVectorspaceLayer,
        addBaseMapQuestLayer: addBaseMapQuestLayer
      };

      /**
       * Mapbox base map generator.
       */
      function addBaseMapboxLayer(layer) {
        layer.olLayer = new ol.layer.Tile({
          zIndex: LAYERS_Z_INDEXES.baseMap,
          source: new ol.source.XYZ({
            url: layer.url,
            attributions: _makeAttribution("&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>")
          })
        });
      }

      /**
       * Tiled WMS layer generator (from external URL).
       */
      function addWmsLayer(layer) {
        layer.olLayer = new ol.layer.Tile({
          zIndex: LAYERS_Z_INDEXES.external,
          source: new ol.source.TileWMS({
            url: layer.url,
            attributions: _makeAttribution(layer.attribution),
            params: {'LAYERS': layer.layers, 'TILED': true}
          })
        });
      }

      /**
       * OpenStreetMap base map generator.
       */
      function addBaseOsmLayer(layer) { // jshint ignore:line
        layer.olLayer = new ol.layer.Tile({
          zIndex: LAYERS_Z_INDEXES.baseMap,
          source: new ol.source.OSM()
        });
      }

      /**
       * Tiled XYZ layer generator (from external URL).
       */
      function addXyzLayer(layer) { // jshint ignore:line
        layer.olLayer = new ol.layer.Tile({
          zIndex: LAYERS_Z_INDEXES.baseMap,
          source: new ol.source.XYZ({
            url: layer.url,
            attributions: _makeAttribution(layer.attribution)
          })
        });
      }

      /**
       * Vector layer generator (from external URL).
       */
      function addVectorLayer(layer) { // jshint ignore:line
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
      }

      /**
       * Vectorspace LR layer generator.
       */
      function addVectorspaceLayer(layer) { // jshint ignore:line
        layer.olLayer = _buildVectorSpaceOlLayer(layer);
        layer.olMapInteractions = _buildVectorSpaceInteractions(layer);
      }

      /**
       * MapQuest base map generator.
       */
      function addBaseMapQuestLayer(layer) { // jshint ignore:line
        layer.olLayer = new ol.layer.Tile({
          zIndex: LAYERS_Z_INDEXES.baseMap,
          source: new ol.source.MapQuest({layer: 'osm'})
        });
      }
    }


    /**
     * @ngdoc method
     * @name  _makeAttribution
     * @methodOf LandApp.service:olExternalLayerService
     * @description
     * Generates a layer attribution object.
     *
     * @param  {String}           attributionHtml HTML attribution string
     * @return {ol.Attribution[]}                 Array of attribution objects
     */
    function _makeAttribution(attributionHtml) { // jshint ignore:line
      return [new ol.Attribution({
        html: (attributionHtml || ('All maps &copy; <a href="https://geovation.uk/">Geovation</a>'))
      })];
    }

    /**
     * @ngdoc method
     * @name  _buildVectorSpaceOlLayer
     * @methodOf LandApp.service:olExternalLayerService
     * @description
     * Builds a new Vectorspace layer (sourced from vectorspace.io),
     * used to display LR titles.
     *
     * @param  {Object}           layer Layer definition object
     * @return {ol.layer.Vector}        Generated vector layer
     */
    function _buildVectorSpaceOlLayer(layer) { // jshint ignore:line
      var newLayer = new ol.layer.Vector({
        zIndex: LAYERS_Z_INDEXES.external,
        maxResolution: 5,
        source: new ol.source.Vector({
          attributions: _makeAttribution('LR &copy; <a href="http://vectorspace.io/">VectorSpace</a>'),
          format: new ol.format.GeoJSON(),
          strategy: ol.loadingstrategy.bbox,
          loader: function (extent, resolution, projection) {
            // wgs84
            extent = ol.proj.transformExtent(extent, "EPSG:3857", "EPSG:4326");

            $http.get(layer.url, {
              headers: {
                "Accept": "application/json;srid=4326"
              },
              params: {
                "bbox": extent.join() + ",4326"
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
    }

    /**
     * @ngdoc method
     * @name  _buildVectorSpaceInteractions
     * @methodOf LandApp.service:olExternalLayerService
     * @description
     * Generates the interactions used for Vectorspace LR titles.
     * Allows the user to select/deselect the titles by clicking on them.
     *
     * @param  {Object}                  layer Layer definition object
     * @return {ol.interaction.Select[]}       Array of interactions
     */
    function _buildVectorSpaceInteractions(layer) { // jshint ignore:line
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
