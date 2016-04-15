/**
 * @ngdoc service
 * @name  LandApp.service:olLayerGroupService
 * @description
 * Manages and allows for interacting with grouped OL layers,
 * where each group is an individual project.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olLayerGroupService', olLayerGroupService);

  /** @ngInject */
  function olLayerGroupService(ol, $log, mapService, activeProjectService) {
    var service = {
      createLayerGroup: createLayerGroup,
      removeLayerGroup: removeLayerGroup,
      setGroupVisibility: setGroupVisibility,
      getActiveLayerGroup: getActiveLayerGroup,
      getBaseFarmLayerGroup: getBaseFarmLayerGroup,
      getActiveLayerByKey: getActiveLayerByKey,
      getLayerDefintions: function() { return _layerDefinitions; },
      isBaseFarmLayerVisible: isBaseFarmLayerVisible,
      hideFarmDataLayers: hideFarmDataLayers
    };

    var _groupCollection = {};
    var _layerDefinitions = {};

    return service;

    ////////////////////////////////// PUBLIC //////////////////////////////////

    /**
     * @ngdoc method
     * @name  createLayerGroup
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Creates a new group of layers and appends them to the map.
     * The group is invisible by default.
     *
     * @param  {String}            groupName        Name of the group
     * @param  {ol.layer.Vector[]} layerList        Array of layers
     * @param  {Object}            layerDefinitions Object of all layer definitions
     * @return {ol.layer.Group}                     Newly created group
     */
    function createLayerGroup(groupName, layerList, layerDefinitions) {
      var group = new ol.layer.Group({
        layers: layerList,
        visible: false
      });

      mapService.getMap().addLayer(group);
      _groupCollection[groupName] = group;
      _layerDefinitions[groupName] = layerDefinitions;

      return group;
    }

    /**
     * @ngdoc method
     * @name  removeLayerGroup
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Removes a group/project and all of its child layers from the map.
     *
     * @param  {String} groupName Name of the project/group
     * @return {Bool}             True if the project was deleted, false otherwise
     */
    function removeLayerGroup(groupName) {
      if (!_groupCollection[groupName]) {
        $log.error(groupName + " is undefined");
        return false;
      }

      mapService.getMap().removeLayer(_groupCollection[groupName]);

      delete _groupCollection[groupName];
      delete _layerDefinitions[groupName];

      return true;
    }

    /**
     * @ngdoc method
     * @name  getActiveLayerGroup
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Returns a collection of the active group layers.
     * @return {Object} Object of layer definition objects, grouped by type
     */
    function getActiveLayerGroup() {
      return _layerDefinitions[activeProjectService.getActiveProjectKey()];
    }

    /**
     * @ngdoc method
     * @name  getBaseFarmLayerGroup
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Returns the base farm group object
     * @return {Object} Group definition object
     */
    function getBaseFarmLayerGroup() {
      return _layerDefinitions.myFarm;
    }

    /**
     * @ngdoc method
     * @name  getActiveLayerByKey
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Returns a specific named layer from the active group.
     *
     * @param  {String}  layerKey       Layer name/key
     * @param  {Boolean} isDrawingLayer Is this a drawing layer?
     * @return {Object}                 Layer definition object
     */
    function getActiveLayerByKey(layerKey, isDrawingLayer) {
      var subKey = isDrawingLayer ? "drawingLayers" : "farmLayers";

      return _layerDefinitions[activeProjectService.getActiveProjectKey()][subKey][layerKey];
    }

    /**
     * @ngdoc method
     * @name  isBaseFarmLayerVisible
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Checks if the base farm layer group is visible.
     * @return {Boolean}  True if the base farm layer group is visible, false otherwise
     */
    function isBaseFarmLayerVisible() {
      return _groupCollection.myFarm && _groupCollection.myFarm.getVisible();
    }

    /**
     * @ngdoc method
     * @name  hideFarmDataLayers
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Hides all of the farm layers which belong to the myFarm project group.
     */
    function hideFarmDataLayers() {
      angular.forEach(_layerDefinitions.myFarm.farmLayers, function(layer) {
        layer.olLayer.setVisible(false);
        layer.checked = false;
      });
    }

    /**
     * @ngdoc method
     * @name  setGroupVisibility
     * @methodOf LandApp.service:olLayerGroupService
     * @description
     * Toggles the visiblity of a named layer group.
     *
     * @param  {String}  groupName Name/key of the project/group
     * @param  {Boolean} isVisible Whether the group is visible
     */
    function setGroupVisibility(groupName, isVisible) {
      // TODO: remove this if. _groupCollection[groupName] could be undefined as there is some
      // async initialization done in the wrong place.
      if (_groupCollection[groupName]) {
        _groupCollection[groupName].setVisible(isVisible);
      }
    }
  }
})();
