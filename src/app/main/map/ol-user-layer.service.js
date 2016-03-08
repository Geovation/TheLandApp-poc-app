/**
 * Handles the creating and interacting with user defined layers
 * stored in the database (drawing and farm layers).
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olUserLayerService', olUserLayerService);

  /** @ngInject */
  function olUserLayerService(ol, $rootScope, $timeout,
    firebaseReferenceService, firebaseLayerService, layerDefinitionsService, loginService, mapService) {
    var service = {
      init: init,
      clearSelectedFeatures: clearSelectedFeatures,
      removeFeature: removeFeature,
      getLayerDetailsByFeature: getLayerDetailsByFeature,
      getExtent: getExtent,
      focusLayer: focusLayer,
      unfocusLayer: unfocusLayer,
      layersCreated: false,
      disableInteractions: disableInteractions,
      enableInteractions: enableInteractions,
      interactionsEnabled: function() {
        return _interactionsEnabled;
      }
    };

    var _mapInteractions = {};
    var _interactionsEnabled = true;

    return service;

    ////////////////////////////// PUBLIC //////////////////////////////

    function init() {
      loginService.onceAuthData().then(loadUserLayersAndEnableEditing);
    }

    /**
     * Clears all selected (highlighted) features
     */
    function clearSelectedFeatures() {
      _mapInteractions.select.getFeatures().clear();
    }

    /**
     * Disables user interactions (clicks, hovers etc.)
     */
    function disableInteractions() {
      _interactionsEnabled = false;
    }

    /**
     * Enables user interactions (clicks, hovers etc.)
     */
    function enableInteractions() {
      _interactionsEnabled = true;
    }

    /**
     * Removes a feature from its parent layer.
     * @param  {ol.Feature} Feature to remove
     */
    function removeFeature(feature) {
      var layerDetails = getLayerDetailsByFeature(feature);

      if (layerDetails) {
        var saveAction;
        layerDetails.olLayer.getSource().removeFeature(feature);

        if (layerDetails.key === 'ownedLr') {
          saveAction = firebaseLayerService.saveFarmLayers([layerDetails]);
        } else {
          saveAction = firebaseLayerService.saveDrawingLayers([layerDetails]);
        }

        saveAction.then(function() {
          clearSelectedFeatures();
        });
      }
    }

    /**
     * Fetches parent layer object for a given feature object.
     * @param  {ol.Feature} Feature to find
     * @return {Object} Layer object (from layerDefinitionsService)
     */
    function getLayerDetailsByFeature(feature) {
      var layerDetails = null;

      angular.forEach(layerDefinitionsService, function(layerGroup) {
        angular.forEach(layerGroup, function(layer) {
          if (!layerDetails &&
              layer.olLayer.getSource().getFeatures &&
              layer.olLayer.getSource().getFeatures().indexOf(feature) > -1) {
            layerDetails = layer;
          }
        });
      });

      return layerDetails;
    }

    /**
     * Calculates an extent for all the drawing and farm layers within the map.
     * @return {ol.Extent}
     */
    function getExtent() {
      var extent = ol.extent.createEmpty();

      var layers = angular.extend(
        {},
        layerDefinitionsService.drawingLayers,
        layerDefinitionsService.farmLayers
      );

      angular.forEach(layers, function(layer) {
        ol.extent.extend(extent, layer.olLayer.getSource().getExtent());
      });

      return extent;
    }

    /**
     * Focuses a given layer by unfocusing all others.
     * @param  {ol.layer.Vector}  Layer to focus
     */
    function focusLayer(layer) {
      mapService.getMap().getLayers().forEach(function(l) {
        if (l !== layer) {
          l.oldOpacity = l.getOpacity();
          l.setOpacity(0.5);
        }
      });
    }

    /**
     * Unfocuses a given layer by focusing all others.
     * @param  {ol.layer.Vector}  Layer to focus
     */
    function unfocusLayer(layer) {
      mapService.getMap().getLayers().forEach(function(l) {
        if (l !== layer) {
          l.setOpacity(l.oldOpacity || 1);
          delete l.oldOpacity;
        }
      });
    }

    ////////////////////////////// PRIVATE //////////////////////////////

    /**
     * Callback method used to initialize the database layers.
     * @param  {Object} Firebase auth data object
     */
    function loadUserLayersAndEnableEditing(authData) {

      loginService.getUid().then(function(uid){
        if (authData || uid) {
          firebaseReferenceService.getUserProjectsRef().once("value", function(projectCollectionSnapshot) {
            projectCollectionSnapshot.forEach(function(projectSnapshot) {
              createLayers(projectSnapshot);
            });
          });
        }
      });

    }

    /**
     * Instantiates the OL layers, adds features and adds them to the map.
     * @param  {Object} Collection of farm and drawing layers
     */
    function createLayers(projectSnapshot) {
      var layerDefinitions = angular.extend(
        {},
        layerDefinitionsService.drawingLayers,
        layerDefinitionsService.farmLayers
      );

      var format = new ol.format.GeoJSON();
      var vectorLayers = [];

      angular.forEach(layerDefinitions, function(layerDetails) {
        layerDetails.olLayer = newVectorLayer(layerDetails);
        vectorLayers.push(layerDetails.olLayer);

        if (layerDefinitionsService.drawingLayers[layerDetails.key]) {
          mapService.getMap().addLayer(layerDetails.olLayer);
        }

        // read + add features
        projectSnapshot.child("layers").forEach(function(layerGroupSnapshot) {
          if (layerGroupSnapshot.hasChild(layerDetails.key)) {
            var layerSnapshot = layerGroupSnapshot.child(layerDetails.key);

            if (layerSnapshot.hasChild("features")) {
              var features = format.readFeatures(layerSnapshot.val());
              layerDetails.olLayer.getSource().addFeatures(features);
            }
          }
        });
      });

      // select + modify interactions
      addControlInteractions(vectorLayers);

      mapService.fitExtent(getExtent());

      $timeout(function() {
        service.layersCreated = true;
      });
    }

    /**
     * Returns a collection of all drawing features that belong
     * to the given set of vector layers.
     *
     * @param  {Array<ol.layer.Vector>} Set of vector layers
     * @return {ol.Collection<ol.Feature>}
     */
    function getDrawingFeatures(vectorLayers) {
      var features = new ol.Collection();

      vectorLayers.forEach(function(layer) {
        angular.forEach(layerDefinitionsService.drawingLayers, function(drawingLayer) {
          if (layer === drawingLayer.olLayer) {
            features.extend(layer.getSource().getFeatures());
          }
        });
      });

      return features;
    }

    /**
     * Adds the select and modify interactions to the provided vector layers.
     * @param  {Array<ol.layer.Vector>} Set of vector layers
     */
    function addControlInteractions(vectorLayers) {
      _mapInteractions.select = new ol.interaction.Select({
        condition: ol.events.condition.singleClick,
        toggleCondition: ol.events.condition.never,
        layers: vectorLayers,
        filter: function() {
          return _interactionsEnabled;
        }
      });

      _mapInteractions.modify = new ol.interaction.Modify({
        features: getDrawingFeatures(vectorLayers)
      });

      _mapInteractions.select.on('select', function(e) {
        $rootScope.$broadcast('toggle-feature-panel', e);
      });

      _mapInteractions.modify.on('modifyend', function() {
        firebaseLayerService.saveDrawingLayers(layerDefinitionsService.drawingLayers);
      });

      mapService.getMap().addInteraction(_mapInteractions.modify);
      mapService.getMap().addInteraction(_mapInteractions.select);
    }

    /**
     * Creates a new OL vector layer instance based on the passed layer details.
     * @param  {Object} Layer object (from layerDefinitionsService)
     * @return {ol.layer.Vector}
     */
    function newVectorLayer(layerDetails) {
      return new ol.layer.Vector({
        source: new ol.source.Vector({}),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: layerDetails.fillColor
          }),
          stroke: new ol.style.Stroke({
            color: layerDetails.strokeColor,
            width: layerDetails.strokeWidth
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: layerDetails.fillColor
            })
          })
        })
      });
    }
  }
})();
