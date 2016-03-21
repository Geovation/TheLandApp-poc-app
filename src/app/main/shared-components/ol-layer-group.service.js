/**
 * Manages and allows for interacting with grouped OL layers,
 * where each group is an individual project.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olLayerGroupService', olLayerGroupService);

  /** @ngInject */
  function olLayerGroupService(ol, mapService, activeProjectService) {
    var service = {
      createLayerGroup: createLayerGroup,
      setGroupVisibility: setGroupVisibility,
      getActiveLayerGroup: getActiveLayerGroup,
      getBaseFarmLayerGroup: getBaseFarmLayerGroup,
      getActiveLayerByKey: getActiveLayerByKey,
      getLayerDefintions: function() { return _layerDefinitions; }
    };

    var _groupCollection = {};
    var _layerDefinitions = {};

    return service;

    ////////////////////////////////// PUBLIC //////////////////////////////////

    /**
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

      // TODO: update openlayers?

      mapService.getMap().addLayer(group);
      _groupCollection[groupName] = group;
      _layerDefinitions[groupName] = layerDefinitions;

      return group;
    }

    /**
     * Returns a collection of the active group layers.
     * @return {Object} Object of layer definition objects, grouped by type
     */
    function getActiveLayerGroup() {
      return _layerDefinitions[activeProjectService.getActiveProjectKey()];
    }

    /**
     * Returns the base farm group object
     * @return {Object} Group definition object
     */
    function getBaseFarmLayerGroup() {
      return _layerDefinitions.myFarm;
    }

    /**
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
     * Toggles the visiblity of a named layer group.
     *
     * @param  {String}  groupName Name/key of the project/group
     * @param  {Boolean} isVisible Whether the group is visible
     */
    function setGroupVisibility(groupName, isVisible) {
      _groupCollection[groupName].setVisible(isVisible);

      // // hide all of the farm layers (lr/rlr/pif) when toggling
      // angular.forEach(_layerDefinitions.myFarm.farmLayers, function(farmLayer) {
      //   farmLayer.olLayer.setVisible(false);
      // });
    }
  }
})();
