/**
 * @ngdoc service
 * @name  LandApp.service:olUserLayerService
 * @description
 * Handles the creating and interacting with user defined layers
 * stored in the database (drawing and farm layers).
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('olUserLayerService', olUserLayerService);

  /** @ngInject */
  function olUserLayerService(ol, $q, $rootScope, $timeout,
    firebaseReferenceService, firebaseLayerService, layerDefinitionsService, loginService, mapService, olLayerGroupService) {
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
      interactionsEnabled: function() { return _interactionsEnabled; },
      createLayers: createLayers,
      readDrawingFeatures: readDrawingFeatures
    };

    var _mapInteractions = {};
    var _interactionsEnabled = true;
    var _drawingFeatures = new ol.Collection();
    var _vectorLayers = [];

    return service;

    ////////////////////////////// PUBLIC //////////////////////////////

    /**
     * @ngdoc method
     * @name  init
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Initializes the service.
     */
    function init() {
      return loginService.onceAuthData().then(loadUserLayersAndEnableEditing);
    }

    /**
     * @ngdoc method
     * @name  clearSelectedFeatures
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Clears all selected (highlighted) features
     */
    function clearSelectedFeatures() {
      if (_mapInteractions.select) {
        _mapInteractions.select.getFeatures().clear();
      }
    }

    /**
     * @ngdoc method
     * @name  disableInteractions
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Disables user interactions (clicks, hovers etc.)
     */
    function disableInteractions() {
      _interactionsEnabled = false;
    }

    /**
     * @ngdoc method
     * @name  enableInteractions
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Enables user interactions (clicks, hovers etc.)
     */
    function enableInteractions() {
      _interactionsEnabled = true;
    }

    /**
     * @ngdoc method
     * @name  removeFeature
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Removes a feature from its parent layer.
     * @param  {ol.Feature} Feature to remove
     */
    function removeFeature(feature) {
      var layerDetails = getLayerDetailsByFeature(feature);

      if (layerDetails) {
        var saveAction;
        layerDetails.olLayer.getSource().removeFeature(feature);

        if (layerDetails.key === 'ownedLr') {
          saveAction = firebaseLayerService.saveFarmLayers(
            [layerDetails],
            layerDetails.isInBaseFarmGroup
          );
        } else {
          saveAction = firebaseLayerService.saveDrawingLayers(
            [layerDetails],
            layerDetails.isInBaseFarmGroup
          );
        }

        saveAction.then(function() {
          clearSelectedFeatures();
        });
      }
    }

    /**
     * @ngdoc method
     * @name  getLayerDetailsByFeature
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Fetches parent Layer definition object for a given feature object.
     * @param  {ol.Feature} Feature to find
     * @return {Object} Layer definition object (from layerDefinitionsService)
     */
    function getLayerDetailsByFeature(feature) {
      var layerDetails = null;

      var groups = [
        olLayerGroupService.getActiveLayerGroup(),
        olLayerGroupService.getBaseFarmLayerGroup()
      ];

      groups.forEach(function(group) {
        angular.forEach(group, function(layerGroup) {
          angular.forEach(layerGroup, function(layer) {
            if (!layerDetails &&
                layer.olLayer.getSource().getFeatures &&
                layer.olLayer.getSource().getFeatures().indexOf(feature) > -1) {
              layerDetails = layer;
              layerDetails.isInBaseFarmGroup = (olLayerGroupService.getBaseFarmLayerGroup() === group);
              layerDetails.isFarmLayer = !!layerDefinitionsService.farmLayers[layer.key];
            }
          });
        });
      });

      return layerDetails;
    }

    /**
     * @ngdoc method
     * @name  getExtent
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Calculates an extent for all the drawing and farm layers within the map.
     * @return {ol.Extent} Extent object
     */
    function getExtent() {
      var extent = ol.extent.createEmpty();

      if (olLayerGroupService.getActiveLayerGroup()) {
        var layers = angular.extend(
          {},
          olLayerGroupService.getActiveLayerGroup().drawingLayers,
          olLayerGroupService.getActiveLayerGroup().farmLayers
        );

        angular.forEach(layers, function(layer) {
          ol.extent.extend(extent, layer.olLayer.getSource().getExtent());
        });
      }

      return extent;
    }

    /**
     * @ngdoc method
     * @name  focusLayer
     * @methodOf LandApp.service:olUserLayerService
     * @description
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
     * @ngdoc method
     * @name  unfocusLayer
     * @methodOf LandApp.service:olUserLayerService
     * @description
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
     * @ngdoc method
     * @name  loadUserLayersAndEnableEditing
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Callback method used to initialize the database layers.
     * @param  {Object}  Firebase auth data object
     * @return {Promise} Promise object
     */
    function loadUserLayersAndEnableEditing(authData) {
      var defer = $q.defer();

      loginService.getRouteUid().then(function(uid){
        if ((authData && !authData.anonymous)|| uid) {
          firebaseReferenceService.getUserProjectsRef().once("value", function(projectCollectionSnapshot) {
            projectCollectionSnapshot.forEach(function(projectSnapshot) {
              _vectorLayers = _vectorLayers.concat(createLayers(projectSnapshot));
            });

            mapService.fitExtent(getExtent());

            readDrawingFeatures();

            // select + modify interactions
            addControlInteractions();

            $timeout(function() {
              service.layersCreated = true;
              defer.resolve();
            });
          });
        }
      });

      return defer.promise;
    }

    /**
     * @ngdoc method
     * @name  createLayers
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Instantiates the OL layers, adds features and adds them to the map.
     * @param  {DataSnapshot}      projectSnapshot  Collection of farm and drawing layers
     * @return {ol.layer.Vector[]}                  List of created layer instances
     */
    function createLayers(projectSnapshot) {
      var layerDefinitions = {
        drawingLayers: angular.copy(layerDefinitionsService.drawingLayers),
        farmLayers: angular.copy(layerDefinitionsService.farmLayers)
      };

      var format = new ol.format.GeoJSON();
      var vectorLayers = [];

      angular.forEach(layerDefinitions, function(layerList) {
        angular.forEach(layerList, function(layerDetails) {
          layerDetails.olLayer = newVectorLayer(layerDetails);
          vectorLayers.push(layerDetails.olLayer);

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
      });

      olLayerGroupService.createLayerGroup(
        projectSnapshot.key(),
        vectorLayers,
        layerDefinitions
      );

      // by default enable the myFarm project
      if (projectSnapshot.key() === "myFarm") {
        olLayerGroupService.setGroupVisibility(projectSnapshot.key(), true);
      }

      return vectorLayers;
    }

    /**
     * @ngdoc method
     * @name  readDrawingFeatures
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Reads and caches all of the drawing features that belong to the current map.
     * This is necessary because ol.interaction.Modify does not provide a
     * filter function, it instead takes an ol.Collection object reference.
     */
    function readDrawingFeatures() {
      // empty the collection to avoid duplicates
      _drawingFeatures.clear();

      var groups = [];

      if (olLayerGroupService.getActiveLayerGroup()) {
        groups.push(olLayerGroupService.getActiveLayerGroup());
      }

      if (olLayerGroupService.isBaseFarmLayerVisible() &&
          olLayerGroupService.getActiveLayerGroup() !== olLayerGroupService.getBaseFarmLayerGroup()) {
        groups.push(olLayerGroupService.getBaseFarmLayerGroup());
      }

      if (groups.length) {
        groups.forEach(function(group) {
          angular.forEach(group.drawingLayers, function(drawingLayer) {
            var index = _vectorLayers.indexOf(drawingLayer.olLayer);
            if (index > -1) {
              _drawingFeatures.extend(_vectorLayers[index].getSource().getFeatures());
            }
          });
        });
      }
    }

    /**
     * @ngdoc method
     * @name  addControlInteractions
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Adds the select and modify interactions to the existing vector layers.
     */
    function addControlInteractions() {
      _mapInteractions.select = new ol.interaction.Select({
        condition: ol.events.condition.singleClick,
        toggleCondition: ol.events.condition.never,
        layers: _vectorLayers,
        filter: function() {
          return _interactionsEnabled;
        }
      });

      _mapInteractions.modify = new ol.interaction.Modify({
        features: _drawingFeatures
      });

      _mapInteractions.select.on('select', function(e) {
        $rootScope.$broadcast('toggle-feature-panel', e);
      });

      _mapInteractions.modify.on('modifyend', function() {
        firebaseLayerService.saveDrawingLayers(olLayerGroupService.getActiveLayerGroup().drawingLayers, false);

        if (olLayerGroupService.isBaseFarmLayerVisible()) {
          firebaseLayerService.saveDrawingLayers(olLayerGroupService.getBaseFarmLayerGroup().drawingLayers, true);
        }
      });

      mapService.getMap().addInteraction(_mapInteractions.modify);
      mapService.getMap().addInteraction(_mapInteractions.select);
    }

    /**
     * @ngdoc method
     * @name  newVectorLayer
     * @methodOf LandApp.service:olUserLayerService
     * @description
     * Creates a new OL vector layer instance based on the passed layer details.
     * @param  {Object} Layer definition object (from layerDefinitionsService)
     * @return {ol.layer.Vector} Created vector layer
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
