(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseLayerService', firebaseLayerService);

  /** @ngInject */
  function firebaseLayerService(ol,
      firebaseReferenceService, layerDefinitionsService, messageService) {

    var service = {
      saveDrawingLayers: saveDrawingLayers,
      saveFarmLayers: saveFarmLayers
    };

    return service;

    //////////////// PUBLIC ////////////////

    function saveDrawingLayers(layersList) {
      _saveLayer(layersList, firebaseReferenceService.getUserDrawingLayersRef());
    }

    function saveFarmLayers(layersList) {
      _saveLayer(layersList, firebaseReferenceService.getUserFarmLayersRef());
    }

    //////////////// PRIVATE ////////////////

    function _saveLayer(layersList, firebaseRef) {
      var payload = {};
      var format = new ol.format.GeoJSON();

      angular.forEach(layersList, function(layer){
        payload[layer.key] = angular.copy(format.writeFeaturesObject(layer.olLayer.getSource().getFeatures()));
      });

      firebaseRef.update(payload)
        .catch(function(error){
          messageService.error(error);
        });
    }

  }

})();
