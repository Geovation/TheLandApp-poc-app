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
  function olLayerGroupService(ol, mapService) {
    var service = {
      createLayerGroup: createLayerGroup,
      toggleGroupVisibility: toggleGroupVisibility
    };

    var _groupCollection = {};

    return service;

    ////////////////////////////////// PUBLIC //////////////////////////////////

    /**
     * Creates a new group of layers and appends them to the map.
     * The group is invisible by default.
     *
     * @param  {String}            groupName Name of the group
     * @param  {ol.layer.Vector[]} layerList Array of layers
     * @return {ol.layer.Group}              Newly created group
     */
    function createLayerGroup(groupName, layerList) {
      var group = new ol.layer.Group({
        layers: layerList,
        visible: false
      });


      // TODO: upgrade openlayers?

      mapService.getMap().addLayer(group);
      _groupCollection[groupName] = group;

      return group;
    }

    /**
     * Toggles the visiblity of a named layer group.
     *
     * @param  {String}  groupName Name/key of the project/group
     * @param  {Boolean} isVisible Whether the group is visible
     */
    function toggleGroupVisibility(groupName, isVisible) {
      angular.forEach(_groupCollection, function(group) {
        group.setVisible(false);
      });

      _groupCollection[groupName].setVisible(isVisible);
    }
  }
})();
