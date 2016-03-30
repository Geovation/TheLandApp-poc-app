/**
 * Manages the activation and deactivation of the drawing tools
 * associated with the map, calls on several other services to
 * trigger certain events (such as tooltip creation or highlight clearing).
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('drawingToolsService', drawingToolsService);

  /** @ngInject */
  function drawingToolsService($log, $mdToast, ol,
      layerDefinitionsService, firebaseLayerService, mapService, tooltipMeasurementService,
      olUserLayerService, olLayerGroupService) {
    var service = {
      init: init,
      drawingLayers: layerDefinitionsService.drawingLayers,
      editToggleDrawingTool: editToggleDrawingTool,
      setVisibleDrawingToolLayer: setVisibleDrawingToolLayer
    };

    return service;

    //////////////////////////// PUBLIC ////////////////////////////

    /**
     * Toggles a specific drawing tool (called by the view when
     * a drawing tool is clicked).
     * @param  {Object} Layer object (from layerDefinitionsService)
     */
    function editToggleDrawingTool(layer) {
      if (layer.draw) {
        deactivateDrawingTool(layer);
      } else {
        activateDrawingTool(layer);
      }
    }

    function init() {
      tooltipMeasurementService.init();
    }

    /**
     * Toggles drawing tool based on user selection.
     * @param {Object}  Layer object (from layerDefinitionsService)
     */
    function setVisibleDrawingToolLayer(layer) {
      var drawingLayer = olLayerGroupService.getActiveLayerByKey(layer.key, true);
      drawingLayer.olLayer.setVisible(layer.checked);
      olUserLayerService.clearSelectedFeatures();
    }

    //////////////////////////// PRIVATE ////////////////////////////
    /**
     * Activates drawing functions for a given drawing layer.
     * @param  {Object} Layer object (from layerDefinitionsService)
     */
    function activateDrawingTool(layer) {
      var drawingLayer = olLayerGroupService.getActiveLayerByKey(layer.key, true);

      $log.debug('activate', layer);

      angular.forEach(service.drawingLayers, deactivateDrawingTool);

      layer.active = true;

      layer.draw = new ol.interaction.Draw({
        source: drawingLayer.olLayer.getSource(),
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

      mapService.getMap().addInteraction(layer.draw);
      tooltipMeasurementService.addTooltip(drawingLayer.olLayer, layer.draw);

      olUserLayerService.focusLayer(drawingLayer.olLayer);
      olUserLayerService.disableInteractions();

      $mdToast.show({
        template: '<md-toast>Start drawing some ' + layer.name + '!</md-toast>',
        hideDelay: 5000,
        position: 'top right'
      });

      drawingLayer.olLayer.setVisible(true);
    }

    /**
     * Deactivates drawing functions for a given drawing layer.
     * @param  {Object} Layer object (from layerDefinitionsService)
     */
    function deactivateDrawingTool(layer) {
      var drawingLayer = olLayerGroupService.getActiveLayerByKey(layer.key, true);
      $log.debug('deactivate', layer);

      if (layer.active) {
        firebaseLayerService.saveDrawingLayers([drawingLayer]);

        layer.active = false;
        mapService.getMap().removeInteraction(layer.draw);
        delete layer.draw;

        olUserLayerService.unfocusLayer(drawingLayer.olLayer);
        olUserLayerService.enableInteractions();
        olUserLayerService.readDrawingFeatures();
      }

      setVisibleDrawingToolLayer(layer);
    }
  }
})();
