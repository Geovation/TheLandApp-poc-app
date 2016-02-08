(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('layerDefinitionsService', layerDefinitionsService);

  /** @ngInject */
  function layerDefinitionsService(ENV, firebaseReferenceService) {
    var layerDefintions = {
      environmentalLayers: createEnvironmentalLayers(),
      baseMapLayers: createBaseMapLayers(),
      farmLayers: createFarmLayers(),
      drawingLayers: createDrawingLayers(),
      nationalDataLayers: createNationalDataLayers(),
    };

    var service = {
      getLayerDefinitons: getLayerDefinitons,
      getOwnedLRLayer: getOwnedLRLayer
    };

    return service;

    //////////

    function getLayerDefinitons() {
      return layerDefintions;
    }

    function getOwnedLRLayer() {
      return layerDefintions.farmLayers
        .filter(function(layer) {
          return layer.name === "owned-lr";
        })
        .shift();
    }

    function createNationalDataLayers() {
      return [{
        name: 'LR Vectors',
        type: 'vectorspace',
        url: "https://api.vectorspace.io/spaces/27085816987650/layers/27790585888771/features?key=" + ENV.vectorspaceKey
      }];
    }

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
      }];
    }

    function createFarmLayers() {
      return [{
        name: 'rlr-parcel',
        displayName: 'RLR Parcel',
        type: 'vector',
        url: "/assets/geojson/watership_down_rpa.geojson",
        fillColor: "rgba(255, 165, 0, 0.5)",
        strokeColor: "rgba(255, 165, 0, 1)",
      }, {
        name: 'rlr-pif',
        displayName: 'RLR PIF',
        type: 'vector',
        url: "/assets/geojson/watership_down_pif.geojson",
        fillColor: "rgba(176, 23, 21, 0.5)",
        strokeColor: "rgba(176, 23, 21, 1)",
      }, {
        name: 'owned-lr',
        displayName: 'Owned LR',
        type: 'vector',
        url: "/assets/geojson/land_registry_boundaries.geojson",
        fillColor: "rgba(176, 23, 21, 0.5)",
        strokeColor: "rgba(176, 23, 21, 1)",
      }];
    }

    function createDrawingLayers() {
      return [
        {
          name: 'Water',
          displayName: 'Water line',
          type: 'LineString',
          icon: 'fa-tint',
          colour: "0, 178, 238",
          strokeWidth: 3,
          checked: true
        }, {
          name: 'Electricity',
          displayName: 'Power line',
          type: 'LineString',
          icon: 'fa-bolt',
          colour: "238, 238, 0",
          strokeWidth: 3,
          checked: true
        }, {
          name: 'Hedges',
          displayName: 'Hedge',
          type: 'LineString',
          icon: 'fa-ellipsis-v',
          colour: "0, 50, 0",
          strokeWidth: 3,
          checked: true
        }, {
          name: 'Trees',
          displayName: 'Tree',
          type: 'Point',
          icon: 'fa-tree',
          colour: "46, 139, 87",
          strokeWidth: 3,
          checked: true
        }, {
          name: 'Buildings',
          displayName: 'Building',
          type: 'Polygon',
          icon: 'fa-industry',
          colour: "144, 78, 39",
          strokeWidth: 3,
          checked: true
        }, {
          name: 'Boundaries',
          displayName: 'Boundary',
          type: 'Polygon',
          icon: 'fa-map-o',
          colour: "0, 0, 0",
          strokeWidth: 3,
          checked: true
        }
      ];
    }
  }

})();
