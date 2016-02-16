(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('drawingToolsService', drawingToolsService);

  /** @ngInject */
  function drawingToolsService($log, $mdToast, $rootScope, $timeout, ol, firebaseReferenceService,
      layerDefinitionsService, firebaseLayerService, mapService, tooltipMeasurementService) {

    var map = null;
    var mapInteractions = {};
    var service = {
      deactivateAllDrawingTools: deactivateAllDrawingTools,
      drawingLayers: layerDefinitionsService.drawingLayers,
      editToggleDrawingTool: editToggleDrawingTool,
      enableDrawing: false,
      getLayerDetailsByFeature: getLayerDetailsByFeature,
      getExtent: getExtent,
      init: init,
      isAnyDrawingToolActive: isAnyDrawingToolActive,
      removeFeature: removeFeature,
      setVisibleDrawingToolLayer: setVisibleDrawingToolLayer,
    };

    return service;

    /////////////// public functions //////////////////////////////////////////

    function deactivateAllDrawingTools() {
      angular.forEach(service.drawingLayers, function(drawingLayer){
        if (drawingLayer.hasOwnProperty('draw')) {
          deactivateDrawingTool(drawingLayer);
        }
      });
    }

    function editToggleDrawingTool(layer) {
      if (layer.draw) {
        deactivateDrawingTool(layer);
      } else {
        activateDrawingTool(layer);
      }
    }

    function getLayerDetailsByFeature(feature) {
      var layerDetails;

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

    function getExtent() {
      var extent = ol.extent.createEmpty();
      angular.forEach(service.drawingLayers, function(layer) {
        ol.extent.extend(extent, layer.olLayer.getSource().getExtent());
      });

      return extent;
    }

    function init() {
      map = mapService.getMap();
      tooltipMeasurementService.init();
      firebaseReferenceService.ref.onAuth(loadUserLayersAndEnableEditing);
    }

    function isAnyDrawingToolActive() {
      var foundDraw = false;

      angular.forEach(service.drawingLayers, function(drawingLayer) {
        if (drawingLayer.hasOwnProperty('draw')) {
          foundDraw = true;
        }
      });

      return foundDraw;
    }

    function removeFeature(feature) {
      var layerDetails = getLayerDetailsByFeature(feature);

      if (layerDetails) {
        layerDetails.olLayer.getSource().removeFeature(feature);

        if (layerDetails.key === "ownedLr") {
          firebaseLayerService.saveFarmLayers([layerDetails]);
        } else {
          firebaseLayerService.saveDrawingLayers([layerDetails]);
        }

        clearSelectedFeatures();
      }
    }

    /** Hide/Unhide drawing tool layer based on tool being checked.
    */
    function setVisibleDrawingToolLayer(layer) {
      layer.olLayer.setVisible(layer.checked);
      clearSelectedFeatures();
    }

    /////////////// private functions /////////////////////////////////////////
    function activateDrawingTool(layer) {
      $log.debug('activate', layer);

      angular.forEach(service.drawingLayers, function(drawingLayer){
        deactivateDrawingTool(drawingLayer);
      });

      layer.active = true;

      layer.draw = new ol.interaction.Draw({
        source: layer.olLayer.getSource(),
        type: layer.type,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: layer.fillColor
          }),
          stroke: new ol.style.Stroke({
            color: layer.strokeColor,
            width: layer.strokeWidth
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: layer.fillColor
            })
          })
        })
      });

      map.addInteraction(layer.draw);
      tooltipMeasurementService.addTooltip(layer.olLayer, layer.draw);

      focusLayer(layer.olLayer);
      $mdToast.show({
        template: '<md-toast>Start drawing some ' + layer.name + '!</md-toast>',
        hideDelay: 5000,
        position: "top right"
      });

      layer.olLayer.setVisible(true);
    }

    function deactivateDrawingTool(layer) {
      $log.debug('deactivate', layer);

      if (layer.active) {
        firebaseLayerService.saveDrawingLayers([layer]);

        layer.active = false;
        map.removeInteraction(layer.draw);
        delete layer.draw;
        unfocusLayer(layer.olLayer);
      }

      setVisibleDrawingToolLayer(layer);
    }

    function clearSelectedFeatures() {
      mapInteractions.select.getFeatures().clear();
    }

    function focusLayer(layer) {
      map.getLayers().getArray().forEach(function(l) {
        if (l !== layer) {
          l.oldOpacity = l.getOpacity();
          l.setOpacity(0.5);
        }
      });
    }

    function loadUserLayersAndEnableEditing(authData) {
      if (authData) {
        firebaseReferenceService.getUserDrawingLayersRef().once("value", function(drawingLayers) {
          firebaseReferenceService.getUserFarmLayersRef().once("value", function(farmLayers) {
            var layerData = {
              drawingLayers: drawingLayers.val(),
              farmLayers: farmLayers.val()
            };

            createLayers(layerData);
          });
        });
      }
    }

    function createLayers(layerData) {
      var layerCollection = angular.extend({}, layerData.drawingLayers, layerData.farmLayers);
      var layerDefinitions = angular.extend({}, layerDefinitionsService.drawingLayers, layerDefinitionsService.farmLayers);
      var format = new ol.format.GeoJSON();
      var vectorLayers = [];

      angular.forEach(layerDefinitions, function(layerDetails) {
        layerDetails.olLayer = newVectorLayer(layerDetails);
        vectorLayers.push(layerDetails.olLayer);

        if (layerDefinitionsService.drawingLayers[layerDetails.key]) {
          map.addLayer(layerDetails.olLayer);
        }

        if (layerCollection && layerCollection[layerDetails.key] && layerCollection[layerDetails.key].features) {
          var features = format.readFeatures(layerCollection[layerDetails.key]);
          layerDetails.olLayer.getSource().addFeatures(features);
        }
      });

      addControlInteractions(vectorLayers);

      mapService.fitExtent(getExtent());

      $timeout(function() {
        service.enableDrawing = true;
      });
    }

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
     * Enables the following drawing layer interactions:
     *  - removing features (by clicking and pressing backspace)
     *  - modifying features (adding/moving attributes)
     */
    function addControlInteractions(vectorLayers) {
      mapInteractions.select = new ol.interaction.Select({
        condition: ol.events.condition.singleClick,
        toggleCondition: ol.events.condition.never,
        layers: vectorLayers,
        filter: function() {
          return !isAnyDrawingToolActive();
        }
      });

      mapInteractions.modify = new ol.interaction.Modify({
        features: getDrawingFeatures(vectorLayers)
      });

      mapInteractions.select.on("select", function(e) {
        $rootScope.$broadcast("toggle-feature-panel", e);
      });

      mapInteractions.modify.on("modifyend", function() {
        firebaseLayerService.saveDrawingLayers(layerDefinitionsService.drawingLayers);
      });

      map.addInteraction(mapInteractions.modify);
      map.addInteraction(mapInteractions.select);
    }

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

    function unfocusLayer(layer) {
      map.getLayers().getArray()
        .filter(function(l) { return l !== layer; })
        .forEach(function(l) {
            l.setOpacity(l.oldOpacity || 1);
            delete l.oldOpacity;
        });
    }
  }
})();
