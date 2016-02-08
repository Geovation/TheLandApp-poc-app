(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseLayerService', firebaseLayerService);

  /** @ngInject */
  function firebaseLayerService(firebaseReferenceService, layerDefinitionsService) {
    var service = {
      saveFarmLayer: saveFarmLayer,
      saveDrawingLayers: saveDrawingLayers
    };

    return service;

    //////////////// PUBLIC ////////////////

    function saveFarmLayer(layerName) {
      var layers = filterLayersByName(layerName, layerDefinitionsService.getLayerDefinitons().farmLayers);

      saveLayers(layers);
    }

    function saveDrawingLayers(layerName) {
      var layers = layerDefinitionsService.getLayerDefinitons().drawingLayers;

      if (layerName) {
        layers = filterLayersByName(layerName, layers);
      }

      saveLayers(layers);
    }

    //////////////// PRIVATE ////////////////

    function filterLayersByName(layerName, layerList) {
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
