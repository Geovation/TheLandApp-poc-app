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

          angular.forEach(projectService.getProjectList(), function(project) {
            if (!projectService.getActiveProject()) {
              project.isActive = true;
            }
          });

          var promise = firebaseReferenceService.getUserProjectsRef()
            .child(projectService.getActiveProject().key)
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
