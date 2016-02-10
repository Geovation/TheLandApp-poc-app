(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseLayerService', firebaseLayerService);

  /** @ngInject */
  function firebaseLayerService(ol,
      firebaseReferenceService, layerDefinitionsService, messageService) {

    var service = {
      saveLayers: saveLayers
    };

    return service;

    //////////////// PUBLIC ////////////////

    function saveLayers(layersList) {
      var payload = {};
      var format = new ol.format.GeoJSON();

      angular.forEach(layersList, function(layer){
        payload[layer.key] = angular.copy(format.writeFeaturesObject(layer.olLayer.getSource().getFeatures()));
      });

      firebaseReferenceService.getUserLayersRef().update(payload)
        .catch(function(error){
          messageService.error(error);
        });
    }

    //////////////// PRIVATE ////////////////

  }

})();
