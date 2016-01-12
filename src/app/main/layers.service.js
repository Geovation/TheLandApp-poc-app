(function() {
  'use strict';

  angular
    .module('LandApp')
    .service('layersService', layersService);

  /** @ngInject */
  function layersService(ENV) {
    var service = {
      environmentalLayers: createEnvironmentalLayers(),
      baseMapLayers: createBaseMapLayers(),
      farmLayers: createFarmLayers(),
      drawingTools: createDrawingTools()
    };

    return service;

    //////////

    function createEnvironmentalLayers() {
      return [{
          name: 'Ancient Woodland',
          type: 'vector',
          url: "/assets/geojson/Ancient_Woodland_England_clipped.geojson",
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)",
        }, {
          name: 'AONB',
          type: 'vector',
          url: "/assets/geojson/AONB_clipped.geojson",
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)",
        }, {
          name: 'SSSI',
          type: 'vector',
          url: "/assets/geojson/Sites_of_special_scientific_interest_england_clipped.geojson",
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)",
      }];
    }

    function createBaseMapLayers() {
      return [{
          name: 'Open Street Map',
          type: 'base.osm'
        }, {
          name: 'Map Quest',
          type: 'base.mapquest'
        }, {
          name: 'Aerial',
          type: 'base.mapbox',
          url: "https://api.tiles.mapbox.com/v4/"+ ENV.mapboxMapId +"/{z}/{x}/{y}.png?access_token=" + ENV.mapboxToken
        }, {
          name: 'Ordnance Survey',
          disabled: true
        }
      ];
    }

    function createFarmLayers() {
      return [{
        name: 'Land Registry',
        type: 'vector',
        // url: "/data/geojson/land_registry_boundaries.geojson",
        url: "/assets/geojson/watership_down_pif.geojson",
        fillColor: "rgba(176, 23, 21, 0.5)",
        strokeColor: "rgba(176, 23, 21, 1)",
      }, {
        name: 'RPA Boundaries',
        type: 'vector',
        url: "/assets/geojson/watership_down_rpa.geojson",
        fillColor: "rgba(255, 165, 0, 0.5)",
        strokeColor: "rgba(255, 165, 0, 1)",
      }, {
        disabled: true,
        name: 'LR Vectors',
        type: 'vector',
        url: "TODO",
        fillColor: "rgba(255, 165, 0, 0.5)",
        strokeColor: "rgba(255, 165, 0, 1)",
      }];
    }

    function createDrawingTools() {
      return [{
            name: 'Water',
            type: 'LineString',
            icon: 'fa-pencil',
            colour: "0, 178, 238",
            strokeWidth: 3,
            checked: true
        }, {
            name: 'Electricity',
            type: 'LineString',
            icon: 'fa-bolt',
            colour: "238, 238, 0",
            strokeWidth: 3,
            checked: true
        }, {
            name: 'Hedge',
            type: 'LineString',
            icon: 'fa-photo',
            colour: "46, 139, 87",
            strokeWidth: 3,
            checked: true
        }, {
            name: 'Tree',
            type: 'Point',
            icon: 'fa-tree',
            colour: "46, 139, 87",
            strokeWidth: 3,
            checked: true
        }, {
            name: 'Buildings',
            type: 'Polygon',
            icon: 'fa-industry',
            colour: "144, 78, 39",
            strokeWidth: 3,
            checked: true
      }];
    }
  }

})();
