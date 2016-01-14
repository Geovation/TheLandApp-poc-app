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
          name: 'AONB',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-areas_of_onb_inspire'
        }, {
          name: 'Ancient Woodland',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-ancient_woodlandv_inspire'
        }, {
          name: 'SAC',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000000000",
          layers: 'eainspire2011-wms-special_area_of_conservation_inspire'
        }, {
          name: 'SSSI',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-sites_of_ssi_inspire'
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
      return [
        {
          name: 'RLR Parcel',
          type: 'vector',
          url: "/assets/geojson/watership_down_rpa.geojson",
          fillColor: "rgba(255, 165, 0, 0.5)",
          strokeColor: "rgba(255, 165, 0, 1)",
        }, {
          name: 'RLR PIF',
          type: 'vector',
          // url: "/data/geojson/land_registry_boundaries.geojson",
          url: "/assets/geojson/watership_down_pif.geojson",
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)",
        }, {
          name: 'LR Vectors',
          type: 'vectorspace',
          url: "https://api.vectorspace.io/spaces/27085816987650/layers/27790585888771/features?key=" + ENV.vectorspaceKey
        }
      ];
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
