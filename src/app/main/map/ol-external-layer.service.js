(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olExternalLayerService', olExternalLayerService);

  /** @ngInject */
  function olExternalLayerService(ol, $log, customLayerService, layerInteractionsService, LAYERS_Z_INDEXES) {
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
                url: layer.url,
                attributions: _makeAttribution("&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>")
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

          case 'xyz':
            layer.olLayer = new ol.layer.Tile({
              zIndex: LAYERS_Z_INDEXES.baseMap,
              source: new ol.source.XYZ({
                  url: layer.url,
                  attributions: _makeAttribution(layer.attribution)
                })
              });
            break;

          case 'wms':
            layer.olLayer = new ol.layer.Tile({
              zIndex: LAYERS_Z_INDEXES.external,
              source: new ol.source.TileWMS({
                url: layer.url,
                attributions: _makeAttribution(layer.attribution),
                params: {'LAYERS': layer.layers, 'TILED': true}
              })
            });
            break;
          case 'vector':
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

    function _makeAttribution(attributionHtml) {
      return [new ol.Attribution({
        html: (attributionHtml || ('All maps &copy; <a href="https://geovation.uk/">Geovation</a>'))
      })];
    }
  }
})();
