(function() {
  'use strict';

  angular
    .module('LandApp')
    .service('layersService', [layersService]);

  /** @ngInject */
  function layersService() {
    var service = {
      environmentalLayers: createEnvironmentalLayers(),
      baseMapLayers: createBaseMapLayers(),
      farmLayers: createFarmLayers()
    };

    return service;
  }

  /////////////

  function createEnvironmentalLayers() {
    return [{
        name: 'Ancient Woodland',
        type: 'vector',
        url: "/assets/geojson/Ancient_Woodland_England_clipped.geojson",
        fillColor: "rgba(176, 23, 21, 0.5)",
        strokeColor: "rgba(176, 23, 21, 1)",
        strokeWidth: 2
      }, {
        disabled: true,
        name: 'AONB',
        type: 'vector',
        url: "/data/geojson/AONB_clipped.geojson",
        fillColor: "rgba(176, 23, 21, 0.5)",
        strokeColor: "rgba(176, 23, 21, 1)",
        strokeWidth: 2
      }, {
        disabled: true,
        name: 'SSSI',
        type: 'vector',
        url: "/data/geojson/Sites_of_special_scientific_interest_england_clipped.geojson",
        fillColor: "rgba(176, 23, 21, 0.5)",
        strokeColor: "rgba(176, 23, 21, 1)",
        strokeWidth: 2
    }];
  }

  function createBaseMapLayers() {
    return [{
      name: 'Open Street Map',
      type: 'osm'
    }, {
      name: 'Aerial',
      type: 'xyz',
      url: "https://api.tiles.mapbox.com/v4/truetoffee.a6d1c57e/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidHJ1ZXRvZmZlZSIsImEiOiJPU2NGeVpNIn0.ZJjeKACNei3rl6k9KLzJlA"
    }, {
      name: 'Ordnance Survey',
      disabled: true
    }];
  }

  function createFarmLayers() {
    return [{
      name: 'Land Registry',
      type: 'vector',
      // url: "/data/geojson/land_registry_boundaries.geojson",
      url: "/assets/geojson/watership_down_pif.geojson",
      fillColor: "rgba(176, 23, 21, 0.5)",
      strokeColor: "rgba(176, 23, 21, 1)",
      strokeWidth: 2
    }, {
      name: 'RPA Boundaries',
      type: 'vector',
      url: "/assets/geojson/watership_down_rpa.geojson",
      fillColor: "rgba(255, 165, 0, 0.5)",
      strokeColor: "rgba(255, 165, 0, 1)",
      strokeWidth: 2
    }, {
      disabled: true,
      name: 'LR Vectors',
      type: 'vector',
      url: "TODO",
      fillColor: "rgba(255, 165, 0, 0.5)",
      strokeColor: "rgba(255, 165, 0, 1)",
      strokeWidth: 2
    }];
  }

})();
