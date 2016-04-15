/**
 * @ngdoc service
 * @name  LandApp.service:layerDefinitionsService
 * @description
 * Contains basic layer definitions for use within the map
 * which are later used to build internal ol layers.
 */
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

    // for practical reasons, add a key value to each layer
    angular.forEach(service, function(layerFamily) {
      angular.forEach(layerFamily, function(layer, layerKey) {
        layer.key = layerKey;
      });
    });

    return service;

    ///////////////// PUBLIC /////////////////

    /**
     * @ngdoc method
     * @name  createNationalDataLayers
     * @methodOf LandApp.service:layerDefinitionsService
     * @description
     * Generates the National Data layer definitions (LR data).
     * @return {Object} Layer definitions
     */
    function createNationalDataLayers() {
      return {
        lrVectors: {
          name: 'LR Vectors',
          type: 'vectorspace',
          url: "https://api.vectorspace.io/spaces/27085816987650/layers/27790585888771/features?key=" + ENV.vectorspaceKey
        }
      };
    }

    /**
     * @ngdoc method
     * @name  createEnvironmentalLayers
     * @methodOf LandApp.service:layerDefinitionsService
     * @description
     * Generates the Environmental layer definitions (AONB, SAC, SSSI, Ancient Woodland).
     * @return {Object} Layer definitions
     */
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

    /**
     * @ngdoc method
     * @name  createBaseMapLayers
     * @methodOf LandApp.service:layerDefinitionsService
     * @description
     * Generates the base map (OSM, OS, Aerial) definitions.
     * @return {Object} Layer definitions
     */
    function createBaseMapLayers() {
      return {
        openStreetMap: {
          name: 'Open Street Map',
          type: 'baseOsm'
        },
        // mapQuest: {
        //   name: 'Map Quest',
        //   type: 'baseMapquest'
        // },
        aerial: {
          name: 'Aerial',
          type: 'baseMapbox',
          url: "https://api.tiles.mapbox.com/v4/"+ ENV.mapboxMapId +"/{z}/{x}/{y}.png?access_token=" + ENV.mapboxToken
        },
        ordnanceSurvey: {
          name: 'Ordnance Survey',
          type: 'xyz',
          attribution: 'OS Maps API &copy; <a src="https://apidocs.os.uk/docs/os-maps-overview">Ordnance Survey</a>',
          // more OS styles : https://apidocs.os.uk/docs/os-maps-technical-detail
          url: 'https://api2.ordnancesurvey.co.uk/mapping_api/v1/service/zxy/EPSG%3A3857/Outdoor 3857/{z}/{x}/{y}.png?key=' + ENV.osKey,
        }
      };
    }

    /**
     * @ngdoc method
     * @name  createFarmLayers
     * @methodOf LandApp.service:layerDefinitionsService
     * @description
     * Generates the farm layer (RLR, MasterMap, owned LR) definitions.
     * @return {Object} Layer definitions
     */
    function createFarmLayers() {
      return {
        rlrParcel: {
          name: 'RLR Parcel',
          fillColor: "rgba(255, 165, 0, 0.5)",
          strokeColor: "rgba(255, 165, 0, 1)",
          strokeWidth: 3,
          checked: false
        },
        rlrPif: {
          name: 'RLR PIF',
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)",
          strokeWidth: 3,
          checked: false
        },
        ordnanceSurveyMasterMap: {
          name: 'Ordnance Survey MasterMap',
          fillColor: "rgba(140, 70, 00, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)",
          strokeWidth: 3,
          checked: false
        },
        ownedLr: {
          name: 'Owned LR',
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)",
          strokeWidth: 3,
          checked: false
        }
      };
    }

    /**
     * @ngdoc method
     * @name  createDrawingLayers
     * @methodOf LandApp.service:layerDefinitionsService
     * @description
     * Generates the drawing layer (water, electricity, hedge etc.) definitions.
     * @return {Object} Layer definitions
     */
    function createDrawingLayers() {
      return {
        water: {
          name: 'Water line',
          type: 'LineString',
          icon: 'fa-tint',
          strokeColor: "rgba(0, 178, 238, 0.9)",
          fillColor: "rgba(0, 178, 238, 0.15)",
          strokeWidth: 3,
          checked: true
        },
        electricity: {
          name: 'Power line',
          type: 'LineString',
          icon: 'fa-bolt',
          strokeColor: "rgba(238, 238, 0, 0.9)",
          fillColor: "rgba(238, 238, 0, 0.15)",
          strokeWidth: 3,
          checked: true
        },
        hedges: {
          name: 'Hedge',
          type: 'LineString',
          icon: 'fa-ellipsis-v',
          strokeColor: "rgba(0, 50, 0, 0.9)",
          fillColor: "rgba(0, 50, 0, 0.15)",
          strokeWidth: 3,
          checked: true
        },
        trees: {
          name: 'Tree',
          type: 'Point',
          icon: 'fa-tree',
          strokeColor: "rgba(46, 139, 87, 0.9)",
          fillColor: "rgba(46, 139, 87, 0.9)",
          strokeWidth: 3,
          checked: true
        },
        buildings: {
          name: 'Building',
          type: 'Polygon',
          icon: 'fa-industry',
          strokeColor: "rgba(144, 78, 39, 0.9)",
          fillColor: "rgba(144, 78, 39, 0.15)",
          strokeWidth: 3,
          checked: true
        },
        boundaries: {
          name: 'Boundary',
          type: 'Polygon',
          icon: 'fa-map-o',
          strokeColor: "rgba(0, 0, 0, 0.9)",
          fillColor: "rgba(0, 0, 0, 0.15)",
          strokeWidth: 3,
          checked: true
        }
      };
    }
  }

})();
