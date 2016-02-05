(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('ollayerDefinitionsService', ollayerDefinitionsService);

  /** @ngInject */
  function ollayerDefinitionsService(ol, $log, customLayerService, layerInteractionsService, LAYERS_Z_INDEXES) {
    var service = {
      buildLayerAndInteractions: buildLayerAndInteractions
    };

    return service;
    /////////////////////

    function buildLayerAndInteractions(layer) {
      if (!layer.olLayer) {
        switch (layer.type) {
          case 'base.mapbox':
            layer.olLayer = new ol.layer.Tile({
              zIndex: LAYERS_Z_INDEXES.baseMap,
              source: new ol.source.XYZ({
                url: layer.url
              })
            });
            break;
          case 'base.osm':
            layer.olLayer = new ol.layer.Tile({
              zIndex: LAYERS_Z_INDEXES.baseMap,
              source: new ol.source.OSM()
            });
            break;
          case 'base.mapquest':
            layer.olLayer = new ol.layer.Tile({
              zIndex: LAYERS_Z_INDEXES.baseMap,
              source: new ol.source.MapQuest({layer: 'osm'})
            });
            break;
          case 'wms':
            layer.olLayer = new ol.layer.Tile({
              zIndex: LAYERS_Z_INDEXES.external,
              source: new ol.source.TileWMS({
                url: layer.url,
                params: {'LAYERS': layer.layers, 'TILED': true}
              })
            });
            break;
          case 'vector':
            layer.olLayer = new ol.layer.Vector({
              zIndex: LAYERS_Z_INDEXES.external,
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
          case 'vectorspace':
            layer.olLayer = customLayerService.buildVectorSpace(layer);
            layer.olMapInteractions = layerInteractionsService.buildVectorSpace(layer);
            break;
          default:
            $log.debug("layer type '" + JSON.stringify(layer.type) + "' not defined");
        }
      }
    } // buildLayerAndInteractions
  }
})();
