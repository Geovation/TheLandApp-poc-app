(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('mapService', mapService);

  /** @ngInject */
  function mapService(ol, proj4, firebaseService, ENV) {

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
      toggleLayerFromCheckProperty: toggleLayerFromCheckProperty,
      zoomIn: zoomIn,
      zoomOut: zoomOut,
    };

    return service;
    // PUBLIC FUNCTIONS ////////////////////////////////////////////////////////
    /** if extent is empty, calculate the extent based on user's layers.
    */
    function fitExtent(extent) {
      // Britisg extend
      // Latitude: 60.8433° to 49.9553°
      // Longitude: -8.17167° to 1.74944°

      // Easting: 64989
      // Northing: 1233616
      //
      // Easting: 669031
      // Northing: 12862

      if (!ol.extent.isEmpty(extent)) {
        view.fit(extent, map.getSize());
      }
    }

    function init() {
      view = new ol.View({
        center: ol.proj.fromLonLat(ENV.defaultMapCenter),
        maxZoom: 20,
        minZoom: 7,
        zoom: 7
      });

      map = new ol.Map({
        target: 'map',
        layers: [],
        loadTilesWhileAnimating: true,
        view: view,
        controls: []
      });

      recenterMapToUserHome();
    }

    function getProjection() {
      return view.getProjection();
    }

    function setBaseMap(baseMap) {
      removeLayer(currentBaseMap);
      currentBaseMap = baseMap;
      addLayer(currentBaseMap);
    }

    function toggleLayerFromCheckProperty(layer) {
      if (layer.checked) {
        addLayer(layer);
      } else {
        removeLayer(layer);
      }
    }

    function zoomIn() {
      view.setZoom(view.getZoom() + 1);
    }

    function zoomOut() {
      view.setZoom(view.getZoom() - 1);
    }

    // PRIVATE FUNCTIONS ///////////////////////////////////////////////////////
    function addLayer(layer) {
      map.addLayer(layer.olLayer);

      angular.forEach(layer.olMapInteractions, function(mapInteraction) {
        map.addInteraction(mapInteraction);
      });
    }

    function removeLayer(layer) {
      map.removeLayer(layer.olLayer);

      angular.forEach(layer.olMapInteractions, function(mapInteraction) {
        map.removeInteraction(mapInteraction);
      });
    }

    function recenterMapToUserHome() {
      firebaseService.getUserInfoRef().once("value").then(function(userInfo) {
        var boundingBox = userInfo.val().homeBoundingBox;

        if (boundingBox) {
          var coord1 = ol.proj.fromLonLat([+boundingBox[2], +boundingBox[0]]);
          var coord2 = ol.proj.fromLonLat([+boundingBox[3], +boundingBox[1]]);

          fitExtent(ol.extent.boundingExtent([coord1, coord2]));
        }
      });
    }

  } // mapService

})();
