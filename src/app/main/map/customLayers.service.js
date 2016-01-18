(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('customLayersService', customLayersService);

  /** @ngInject */
  function customLayersService(ol, $http, $log) {
    var service = {
      buildVectorSpace: buildVectorSpace
    };

    return service;

    function buildVectorSpace(layerIndexes, layer) {
      var newLayer = new ol.layer.Vector({
        zIndex: layerIndexes.external,
        maxResolution: 5,
        source: new ol.source.Vector({
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
    } // buildVectorSpace
  }
})();
