(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseLayerService', firebaseLayerService);

  /** @ngInject */
  function firebaseLayerService(firebaseReferenceService, layerDefinitionsService) {
    var service = {
      saveFarmLayers: saveFarmLayers,
      saveDrawingLayers: saveDrawingLayers
    };

    return service;

    //////////////// PUBLIC ////////////////

    function saveFarmLayers(layerName) {
      var layers = layerDefinitionsService.getLayerDefinitons().farmLayers;

      if (layerName) {
        layers = findLayersByName(layerName, layers);
      }

      saveLayers(layers);
    }

    function saveDrawingLayers(layerName) {
      var layers = layerDefinitionsService.getLayerDefinitons().drawingLayers;

      if (layerName) {
        layers = findLayersByName(layerName, layers);
      }

      saveLayers(layers);
    }

    //////////////// PRIVATE ////////////////

    function findLayersByName(layerName, layerList) {
      return layerList.filter(function(layer) {
        return layerName === layer.name;
      });
    }

    function saveLayers(layersList) {
      var payload = {};
      var format = new ol.format.GeoJSON();

      layersList.forEach(function(layer) {
        payload[layer.name] = angular.copy(format.writeFeaturesObject(layer.olLayer.getSource().getFeatures()));
      });

      firebaseReferenceService.getUserLayersRef().update(payload);
    }
  }

})();
