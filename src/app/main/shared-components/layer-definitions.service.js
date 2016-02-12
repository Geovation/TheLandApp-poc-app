(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('layerDefinitionsService', layerDefinitionsService);

  /** @ngInject */
  function layerDefinitionsService(ENV) {

    var service = {
      environmentalLayers: createEnvironmentalLayers(),
      baseMapLayers: createBaseMapLayers(),
      farmLayers: createFarmLayers(),
      drawingLayers: createDrawingLayers(),
      nationalDataLayers: createNationalDataLayers(),
    };

    // for practical reasons, add a key value to each layer and a name if it
    // is not defined
    angular.forEach(service, function(layerFamily) {
      angular.forEach(layerFamily, function(layer, layerKey) {
        layer.key = layerKey;
      });
    });

    return service;

    //////////

    function createNationalDataLayers() {
      return {
        lrVectors: {
          name: 'LR Vectors',
          type: 'vectorspace',
          url: "https://api.vectorspace.io/spaces/27085816987650/layers/27790585888771/features?key=" + ENV.vectorspaceKey
        }
      };
    }

    function createEnvironmentalLayers() {
      return {
        aonb: {
          name: 'AONB',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-areas_of_onb_inspire'
        },
        ancientWoodland: {
          name: 'Ancient Woodland',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-ancient_woodlandv_inspire'
        },
        sac: {
          name: 'SAC',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000000000",
          layers: 'eainspire2011-wms-special_area_of_conservation_inspire'
        },
        sssi: {
          name: 'SSSI',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-sites_of_ssi_inspire'
        }
      };
    }


    function createBaseMapLayers() {
      return {
        openStreetMap: {
          name: 'Open Street Map',
          type: 'base.osm'
        },
        // mapQuest: {
        //   name: 'Map Quest',
        //   type: 'base.mapquest'
        // },
        aerial: {
          name: 'Aerial',
          type: 'base.mapbox',
          url: "https://api.tiles.mapbox.com/v4/"+ ENV.mapboxMapId +"/{z}/{x}/{y}.png?access_token=" + ENV.mapboxToken
        },
        ordnanceSurvey: {
          name: 'Ordnance Survey',
          type: 'xyz',
          // more OS styles : https://apidocs.os.uk/docs/os-maps-technical-detail
          url: 'https://api2.ordnancesurvey.co.uk/mapping_api/v1/service/zxy/EPSG%3A3857/Outdoor 3857/{z}/{x}/{y}.png?key=' + ENV.osKey,
        }
      };
    }

    function createFarmLayers() {
      return {
        rlrParcel: {
          name: 'RLR Parcel',
          fillColor: "rgba(255, 165, 0, 0.5)",
          strokeColor: "rgba(255, 165, 0, 1)"
        },
        rlrPif: {
          name: 'RLR PIF',
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)"
        },
        ordnanceSurveyMasterMap: {
          name: 'Ordnance Survey MasterMap',
          fillColor: "rgba(140, 70, 00, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)"
        },
        ownedLr: {
          name: 'Owned LR',
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)"
        }
      };
    }

    function createDrawingLayers() {
      return {
        water: {
          name: 'Water line',
          type: 'LineString',
          icon: 'fa-tint',
          colour: "0, 178, 238",
          strokeWidth: 3,
          checked: true
        },
        electricity: {
          name: 'Power line',
          type: 'LineString',
          icon: 'fa-bolt',
          colour: "238, 238, 0",
          strokeWidth: 3,
          checked: true
        },
        hedges: {
          name: 'Hedge',
          type: 'LineString',
          icon: 'fa-ellipsis-v',
          colour: "0, 50, 0",
          strokeWidth: 3,
          checked: true
        },
        trees: {
          name: 'Tree',
          type: 'Point',
          icon: 'fa-tree',
          colour: "46, 139, 87",
          strokeWidth: 3,
          checked: true
        },
        buildings: {
          name: 'Building',
          type: 'Polygon',
          icon: 'fa-industry',
          colour: "144, 78, 39",
          strokeWidth: 3,
          checked: true
        },
        boundaries: {
          name: 'Boundary',
          type: 'Polygon',
          icon: 'fa-map-o',
          colour: "0, 0, 0",
          strokeWidth: 3,
          checked: true
        }
      };
    }
  }

})();
