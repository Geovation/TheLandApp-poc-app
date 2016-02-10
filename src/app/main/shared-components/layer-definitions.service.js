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
        layer.name = layer.name || layerKey.replace(/([A-Z])/g, " $1").trim();
      });
    });

    return service;

    //////////

    function createNationalDataLayers() {
      return {
        "LRVectors": {
          name: 'LR Vectors',
          type: 'vectorspace',
          url: "https://api.vectorspace.io/spaces/27085816987650/layers/27790585888771/features?key=" + ENV.vectorspaceKey
        }
      };
    }

    function createEnvironmentalLayers() {
      return {
        "AONB": {
          name: 'AONB',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-areas_of_onb_inspire'
        },
        "AncientWoodland": {
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-ancient_woodlandv_inspire'
        },
        "SAC": {
          name: 'SAC',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000000000",
          layers: 'eainspire2011-wms-special_area_of_conservation_inspire'
        },
        "SSSI": {
          name: 'SSSI',
          type: 'wms',
          url: "https://www.geostore.com/OGC/OGCInterface?UID=UDATAGOV2011&PASSWORD=datagov2011&INTERFACE=ENVIRONMENT&LC=2000000000000040000000000000000000000000000000000001040000000000000000",
          layers: 'eainspire2011-wms-sites_of_ssi_inspire'
        }
      };
    }

    function createBaseMapLayers() {
      return {
        "OpenStreetMap": {
          type: 'base.osm'
        },
        "MapQuest": {
          type: 'base.mapquest'
        },
        "Aerial": {
          type: 'base.mapbox',
          url: "https://api.tiles.mapbox.com/v4/"+ ENV.mapboxMapId +"/{z}/{x}/{y}.png?access_token=" + ENV.mapboxToken
        },
        "OrdnanceSurvey": {
          type: 'base.os',
          disabled: true
        }
      };
    }

    function createFarmLayers() {
      return {
        "RLRParcel": {
          name: 'RLR Parcel',
          type: 'Polygon',
          fillColor: "rgba(255, 165, 0, 0.5)",
          strokeColor: "rgba(255, 165, 0, 1)"
        },
        "RLRPIF": {
          name: 'RLR PIF',
          type: 'vector',
          url: "/assets/geojson/watership_down_pif.geojson",
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)"
        },
        "OwnedLR": {
          name: 'Owned LR',
          type: 'vector',
          url: "/assets/geojson/land_registry_boundaries.geojson",
          fillColor: "rgba(176, 23, 21, 0.5)",
          strokeColor: "rgba(176, 23, 21, 1)"
        }
      };
    }

    function createDrawingLayers() {
      return {
        "Water" : {
          name: 'Water line',
          type: 'LineString',
          icon: 'fa-tint',
          colour: "0, 178, 238",
          strokeWidth: 3,
          checked: true
        },
        "Electricity": {
          name: 'Power line',
          type: 'LineString',
          icon: 'fa-bolt',
          colour: "238, 238, 0",
          strokeWidth: 3,
          checked: true
        },
        "Hedges": {
          name: 'Hedge',
          type: 'LineString',
          icon: 'fa-ellipsis-v',
          colour: "0, 50, 0",
          strokeWidth: 3,
          checked: true
        },
        "Trees": {
          name: 'Tree',
          type: 'Point',
          icon: 'fa-tree',
          colour: "46, 139, 87",
          strokeWidth: 3,
          checked: true
        },
        "Buildings": {
          name: 'Building',
          type: 'Polygon',
          icon: 'fa-industry',
          colour: "144, 78, 39",
          strokeWidth: 3,
          checked: true
        },
        "Boundaries": {
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
