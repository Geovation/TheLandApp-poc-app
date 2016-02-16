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
      var layerDetails = {};

      angular.forEach(layerDefinitionsService, function(layerGroup) {
        angular.forEach(layerGroup, function(layer) {
          if (!layerDetails.layer &&
              layer.olLayer.getSource().getFeatures &&
              layer.olLayer.getSource().getFeatures().indexOf(feature) > -1) {
            layerDetails.layer = layer.olLayer;
            layerDetails.name = layer.name;
            layerDetails.key = layer.key;
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

      if (layerDetails.layer) {
        layerDetails.layer.getSource().removeFeature(feature);
        firebaseLayerService.saveLayer(layerDetails);
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
            color: "rgba(" + layer.colour +  ", 0.15)"
          }),
          stroke: new ol.style.Stroke({
            color: "rgba(" + layer.colour +  ", 0.9)",
            width: layer.strokeWidth
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: "rgba(" + layer.colour +  ", 0.9)"
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

    /**
     * Enables the following drawing layer interactions:
     *  - removing features (by clicking and pressing backspace)
     *  - modifying features (adding/moving attributes)
     */
    function addControlInteractions(vectorLayers, map) {
      mapInteractions.featureSelect = new ol.interaction.Select({
        condition: ol.events.condition.singleClick,
        toggleCondition: ol.events.condition.never,
        layers: vectorLayers,
        filter: function() {
          return !isAnyDrawingToolActive();
        }
      });

      mapInteractions.featureModify = new ol.interaction.Modify({
        features: mapInteractions.featureSelect.getFeatures()
      });

      mapInteractions.featureSelect.on("select", function(e) {
        $rootScope.$broadcast("toggle-feature-panel", e);
      });

      mapInteractions.featureModify.on("modifyend", function() {
        firebaseLayerService.saveDrawingLayers(layerDefinitionsService.drawingLayers);
      });

      map.addInteraction(mapInteractions.featureModify);
      map.addInteraction(mapInteractions.featureSelect);
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
      mapInteractions.featureSelect.getFeatures().clear();
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
          var layers = drawingLayers.val();
          var format = new ol.format.GeoJSON();
          $log.debug(layers);

          // populate drawingLayers with Open Layers vector layers.
          var vectorLayers = [];
          angular.forEach(service.drawingLayers, function(drawingLayer){
            drawingLayer.olLayer = newVectorLayer(drawingLayer.name, drawingLayer.colour, drawingLayer.strokeWidth);
            vectorLayers.push(drawingLayer.olLayer);
            map.addLayer(drawingLayer.olLayer);

            if (layers && layers[drawingLayer.key] && layers[drawingLayer.key].features) {
              var features = format.readFeatures(layers[drawingLayer.key]);
              drawingLayer.olLayer.getSource().addFeatures(features);
            }
          });

          addControlInteractions(vectorLayers, map);

          mapService.fitExtent(getExtent());
          $timeout(function() {service.enableDrawing = true;});
        });
      }
    }

    function newVectorLayer(name, colour, strokeWidth) {
      return new ol.layer.Vector({
        source: new ol.source.Vector({}),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: "rgba(" + colour +  ", 0.15)"
          }),
          stroke: new ol.style.Stroke({
            color: "rgba(" + colour +  ", 0.9)",
            width: strokeWidth
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: "rgba(" + colour +  ", 0.9)"
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
