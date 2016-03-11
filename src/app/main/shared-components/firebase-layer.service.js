(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseLayerService', firebaseLayerService);

  /** @ngInject */
  function firebaseLayerService(ol, $q,
      firebaseReferenceService, layerDefinitionsService, messageService, activeProjectService) {

    var service = {
      saveDrawingLayers: saveDrawingLayers,
      saveFarmLayers: saveFarmLayers
    };

    return service;

    //////////////// PUBLIC ////////////////

    function saveDrawingLayers(layersList) {
      return _saveLayer(layersList, "drawing");
    }

    function saveFarmLayers(layersList) {
      return _saveLayer(layersList, "farm");
    }

    //////////////// PRIVATE ////////////////

    function _saveLayer(layersList, layerGroupName) {
      var deferred = $q.defer();

      var format = new ol.format.GeoJSON();

      var i = 0;
      var canContinue = true;

      angular.forEach(layersList, function(layer) {
        if (canContinue) {
          var payload = angular.copy(
            format.writeFeaturesObject(layer.olLayer.getSource().getFeatures())
          );

          var promise = firebaseReferenceService.getUserProjectsRef()
            .child(activeProjectService.getActiveProjectKey())
            .child("layers")
            .child(layerGroupName)
            .child(layer.key)
            .update(payload);

          promise
            .then(function() {
              i++;

              if (layersList.length === i) {
                deferred.resolve();
              }
            })
            .catch(function(error) {
              canContinue = false;
              deferred.reject(error);
              messageService.error(error);
            });
        }
      });

      return deferred.promise;
    }

  }

})();
