(function() {
  'use strict';

  angular
    .module('LandApp')
    .service('mapService', ['$rootScope', '$http', mapService]);

  /** @ngInject */
  function mapService() {
    var service = {
      addBaseMaps: addBaseMaps
    };

    return service;
  }

  ///////////////

  function addBaseMaps(map) {
    angular.forEach(baseMapLayers, function(layerDefinition) {
      if (layerDefinition.layer) {
        map.addLayer(layerDefinition.layer);
      }
    });
  }

  var baseMapLayers = [
    {
      name: "Open Street Map",
      layer: new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    },
    {
      name: "Aerial",
      layer: new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: "https://api.tiles.mapbox.com/v4/truetoffee.a6d1c57e/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidHJ1ZXRvZmZlZSIsImEiOiJPU2NGeVpNIn0.ZJjeKACNei3rl6k9KLzJlA"
        })
      })
    },
    {
      name: "Ordnance Survey",
      disabled: true
    }
  ];

})();
