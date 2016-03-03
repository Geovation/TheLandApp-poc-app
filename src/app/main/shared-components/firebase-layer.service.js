(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseLayerService', firebaseLayerService);

  /** @ngInject */
  function firebaseLayerService(ol, $q,
      firebaseReferenceService, layerDefinitionsService, projectService, messageService) {

    var service = {
      saveDrawingLayers: saveDrawingLayers,
      saveFarmLayers: saveFarmLayers
    };

    return service;

    //////////////// PUBLIC ////////////////

    function saveDrawingLayers(layersList) {
      return _saveLayer(layersList, firebaseReferenceService.getUserDrawingLayersRef());
    }

    function saveFarmLayers(layersList) {
      return _saveLayer(layersList, firebaseReferenceService.getUserFarmLayersRef());
    }

    //////////////// PRIVATE ////////////////

    function _saveLayer(layersList, firebaseRef) {
      var deferred = $q.defer();

      var payload = {};
      var format = new ol.format.GeoJSON();

      angular.forEach(layersList, function(layer){
        payload[layer.key] = angular.copy(format.writeFeaturesObject(layer.olLayer.getSource().getFeatures()));
      });

      firebaseRef.update(payload)
        .then(function(){
          deferred.resolve();
        })
        .catch(function(error){
          deferred.reject(error);
          messageService.error(error);
        });

      return deferred.promise;
    }

  }

})();
