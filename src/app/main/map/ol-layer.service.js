(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olLayerService', olLayerService);

  /** @ngInject */
  function olLayerService(ol, $log, LAYERS_Z_INDEXES) {
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
            layer.olLayer = _buildVectorSpaceOlLayer(layer);
            layer.olMapInteractions = _buildVectorSpaceOlMapInteractions(layer);
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

    function _buildVectorSpaceOlLayer(layer) {
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

    function _buildVectorSpaceOlMapInteractions(layer) {
      var click = new ol.interaction.Select({
        condition: function (e) {
          return ol.events.condition.click(e) && !drawingToolsService.isAnyDrawingToolActive();
        },
        layers: [layer.olLayer]
      });

      click.on('select', function() {
        $timeout(function() {
          $rootScope.$broadcast('land-registry-features-selected', click.getFeatures().getArray());
        });
      });

      return [click];
    }
  }
})();
