/**
 * Manages the ol.Map instance and the interactions associated with it.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('mapService', mapService);

  /** @ngInject */
  function mapService(ol, proj4, firebaseReferenceService, ENV) {

    // define EPSG:27700
    proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");

    var currentBaseMap = {};
    var view = {};
    var map = {};

    var service = {
      fitExtent: fitExtent,
      getMap: function() { return map;},
      getProjection: getProjection,
      init: init,
      setBaseMap: setBaseMap,
      setZoom: setZoom,
      toggleLayerFromCheckProperty: toggleLayerFromCheckProperty
    };

    return service;

    //////////////////////////////// PUBLIC FUNCTIONS ////////////////////////////////

    /**
     * Fits the view to the provided extent,
     * which is based on the user's layer data.
     *
     * @param  {ol.Extent} extent Extent object
     */
    function fitExtent(extent) {
      if (!ol.extent.isEmpty(extent)) {
        view.fit(extent, map.getSize());
      }
    }

    /**
     * Init method
     */
    function init() {
      view = new ol.View({
        center: ol.proj.fromLonLat(ENV.defaultMapCenter),
        maxZoom: ENV.maxZoom,
        minZoom: ENV.minZoom,
        zoom: ENV.defaultZoom
      });

      var attribution = new ol.control.Attribution({
        collapsible: false,
        collapsed: false
      });

      map = new ol.Map({
        target: 'map',
        layers: [],
        loadTilesWhileAnimating: true,
        view: view,
        controls: [attribution, new ol.control.Zoom()]
      });

      recenterMapToUserHome();
    }

    /**
     * Zooms the map to the provided level
     * @param {number} zoomLevel Zoom level
     */
    function setZoom(zoomLevel) {
      view.setZoom(zoomLevel);
    }

    /**
     * Returns the projection of the view
     * @return {ol.proj.Projection} Projection object
     */
    function getProjection() {
      return view.getProjection();
    }

    /**
     * Changes the base layer of the map.
     * @param {Object} baseMap Layer object
     */
    function setBaseMap(baseMap) {
      if (currentBaseMap.olLayer) {
        removeLayer(currentBaseMap);
      }

      currentBaseMap = baseMap;
      addLayer(currentBaseMap);
    }

    /**
     * Toggles the layer on/off based on its layer.checked property.
     *
     * @param  {Object} layer Layer object
     */
    function toggleLayerFromCheckProperty(layer) {
      if (layer.checked) {
        addLayer(layer);
      } else {
        removeLayer(layer);
      }
    }

    //////////////////////////////// PRIVATE FUNCTIONS ////////////////////////////////
    /**
     * Adds a layer to the map. If the layer has already been added,
     * it will only display it.
     *
     * @param {Object} layer Layer object
     */
    function addLayer(layer) {
      // prevent adding duplicate layers to the map
      if (map.getLayers().getArray().indexOf(layer.olLayer) === -1) {
        map.addLayer(layer.olLayer);

        angular.forEach(layer.olMapInteractions, function(mapInteraction) {
          map.addInteraction(mapInteraction);
        });
      }

      layer.olLayer.setVisible(true);
    }

    /**
     * Removes a layer from the map.
     *
     * @param  {Object} layer Layer object
     */
    function removeLayer(layer) {
      layer.olLayer.setVisible(false);
      map.removeLayer(layer.olLayer);

      angular.forEach(layer.olMapInteractions, function(mapInteraction) {
        map.removeInteraction(mapInteraction);
      });
    }

    /**
     * Recenters the map to the user's home bounding box.
     */
    function recenterMapToUserHome() {
      firebaseReferenceService.getUserInfoRef().once("value").then(function(userInfo) {
        var boundingBox = userInfo.val().homeBoundingBox;

        if (boundingBox) {
          var coord1 = ol.proj.fromLonLat([+boundingBox[2], +boundingBox[0]]);
          var coord2 = ol.proj.fromLonLat([+boundingBox[3], +boundingBox[1]]);

          fitExtent(ol.extent.boundingExtent([coord1, coord2]));
        }
      });
    }
  }
})();
