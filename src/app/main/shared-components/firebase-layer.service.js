/**
 * @ngdoc service
 * @name  LandApp.service:firebaseLayerService
 * @description
 * Manages the saving of farm and drawing layers to the database.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseLayerService', firebaseLayerService);

  /** @ngInject */
  function firebaseLayerService(ol, $q,
      firebaseReferenceService, messageService, activeProjectService) {

    var service = {
      saveDrawingLayers: saveDrawingLayers,
      saveFarmLayers: saveFarmLayers
    };

    return service;

    //////////////// PUBLIC ////////////////

    /**
     * @ngdoc method
     * @name  saveDrawingLayers
     * @methodOf LandApp.service:firebaseLayerService
     * @description
     * Saves a set of drawing layers to the database.
     *
     * @param  {Object[]}  layersList      List of drawing layer definition objects
     * @param  {Boolean}   isBaseFarmLayer True if these layers belong to the base farm project
     * @return {Promise}                   Promise object
     */
    function saveDrawingLayers(layersList, isBaseFarmLayer) {
      return _saveLayer(layersList, "drawing", isBaseFarmLayer);
    }

    /**
     * @ngdoc method
     * @name  saveFarmLayers
     * @methodOf LandApp.service:firebaseLayerService
     * @description
     * Saves a set of farm layers to the database.
     *
     * @param  {Object[]}  layersList      List of farm layer definition objects
     * @param  {Boolean}   isBaseFarmLayer True if these layers belong to the base farm project
     * @return {Promise}                   Promise object
     */
    function saveFarmLayers(layersList, isBaseFarmLayer) {
      return _saveLayer(layersList, "farm", isBaseFarmLayer);
    }

    //////////////// PRIVATE ////////////////

    /**
     * @ngdoc method
     * @name  _saveLayer
     * @methodOf LandApp.service:firebaseLayerService
     * @description
     * Saves a set of layers to the database.
     *
     * @param  {Object[]} layersList      List of layer definition objects
     * @param  {String}   layerGroupName  Layer group name (farm/drawing)
     * @param  {Boolean}  isBaseFarmLayer True if these layers belong to the base farm project
     * @return {Promise}                  Promise object
     */
    function _saveLayer(layersList, layerGroupName, isBaseFarmLayer) {
      var deferred = $q.defer();
      var format = new ol.format.GeoJSON();
      var payload = {};

      angular.forEach(layersList, function(layer) {
        payload[layer.key] = angular.copy(
          format.writeFeaturesObject(layer.olLayer.getSource().getFeatures())
        );
      });

      var projectKey = isBaseFarmLayer ? "myFarm" : activeProjectService.getActiveProjectKey();

      var promise = firebaseReferenceService.getUserLayersRef(projectKey)
        .child(layerGroupName)
        .update(payload);

      promise
        .then(deferred.resolve)
        .catch(function(error) {
          deferred.reject(error);
          messageService.error(error);
        });

      return deferred.promise;
    }

  }

})();
