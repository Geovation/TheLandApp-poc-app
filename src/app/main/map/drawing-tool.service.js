(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('drawingToolsService', drawingToolsService);

  /** @ngInject */
  function drawingToolsService($log, $mdToast, $rootScope, $timeout, ol, firebaseService,
      layersService, mapService, tooltipMeasurementService) {

    var drawingLayers = layersService.drawingLayers;
    var map = null;
    var enableDrawing = false;
    var mapInteractions = {};
    var service = {
      addFeaturesToDrawingLayer: addFeaturesToDrawingLayer,
      deactivateAllDrawingTools: deactivateAllDrawingTools,
      editToggleDrawingTool: editToggleDrawingTool,
      getDrawingLayerDetailsByFeature: getDrawingLayerDetailsByFeature,
      getDrawingLayers: function() {return drawingLayers;},
      getEnableDrawing: function() {return enableDrawing;},
      getExtent: getExtent,
      init: init,
      isAnyDrawingToolActive: isAnyDrawingToolActive,
      removeFeature: removeFeature,
      saveDrawingLayers: saveDrawingLayers,
      setVisibleDrawingToolLayer: setVisibleDrawingToolLayer,
    };

    firebaseService.auth.$onAuth(loadUserLayersAndEnableEditing);

    return service;
    /////////////// public functions //////////////////////////////////////////
    function addFeaturesToDrawingLayer(drawingLayerName, features) {
      drawingLayers
        .find(function(layer){return layer.name === drawingLayerName;})
        .olLayer.getSource().addFeatures(features);
      saveDrawingLayers(drawingLayerName);
    }

    function deactivateAllDrawingTools() {
      drawingLayers
        .filter(function(dt) { return dt.hasOwnProperty('draw');} )
        .forEach(deactivateDrawingTool);
    }

    function editToggleDrawingTool(layer) {
      if (layer.draw) {
        deactivateDrawingTool(layer);
      } else {
        activateDrawingTool(layer);
      }
    }

    function getDrawingLayerDetailsByFeature(feature) {
      var layerDetails = {};

      drawingLayers.forEach(function(layer){
        if (layer.olLayer.getSource().getFeatures().indexOf(feature) > -1) {
          layerDetails.layer = layer.olLayer;
          layerDetails.name = layer.name;
          layerDetails.displayName = layer.displayName;
        }
      });

      return layerDetails;
    }

    function getExtent() {
      var extent = ol.extent.createEmpty();
      angular.forEach(drawingLayers, function(layer) {
        ol.extent.extend(extent, layer.olLayer.getSource().getExtent());
      });

      return extent;
    }

    function init() {
      map = mapService.getMap();
    }

    function isAnyDrawingToolActive() {
      return drawingLayers
        .filter(function(dt) { return dt.hasOwnProperty('draw');} )
        .length > 0;
    }

    function removeFeature(feature) {
      var layerDetails = getDrawingLayerDetailsByFeature(feature);

      if (layerDetails.layer) {
        layerDetails.layer.getSource().removeFeature(feature);
        saveDrawingLayers();
        clearSelectedFeatures();
      }
    }

    /** Hide/Unhide drawing tool layer based on tool being checked.
    */
    function setVisibleDrawingToolLayer(layer) {
      layer.olLayer.setVisible(layer.checked);
      clearSelectedFeatures();
    }
    /**
     * Saves the current drawing layers to the database.
     *
     * @param {string|undefined} singleLayerName If defined, will only save this named layer.
     */
    function saveDrawingLayers(singleLayerName) {
      var format = new ol.format.GeoJSON();

      angular.forEach(drawingLayers, function(layer) {
        if (angular.isDefined(singleLayerName) && (layer.name !== singleLayerName)) {
          return;
        }

        var payload = angular.copy(format.writeFeaturesObject(layer.olLayer.getSource().getFeatures()));

        firebaseService.getUserLayersRef().child(layer.name).set(payload);
      });
    }
    /////////////// private functions /////////////////////////////////////////
    function activateDrawingTool(layer) {
      $log.debug('activate', layer);

      drawingLayers.forEach(function(dt){
        deactivateDrawingTool(dt);
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
        saveDrawingLayers();
      });

      map.addInteraction(mapInteractions.featureModify);
      map.addInteraction(mapInteractions.featureSelect);
    }

    function deactivateDrawingTool(layer) {
      $log.debug('deactivate', layer);

      if (layer.active) {
        saveDrawingLayers(layer.name);

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
      map.getLayers().getArray()
        .filter(function(l) { return l !== layer; })
        .forEach(function(l) {
            l.oldOpacity = l.getOpacity();
            l.setOpacity(0.5);
        });
    }

    function loadUserLayersAndEnableEditing(authData) {
      if (authData) {
        firebaseService.getUserLayersRef().once("value", function(userLayers) {
          $log.debug(userLayers);

          var layers = userLayers.val();
          var format = new ol.format.GeoJSON();

          // populate drawingLayers with Open Layers vector layers.
          var vectorLayers = [];

          drawingLayers.forEach(function(layer){
            layer.olLayer = newVectorLayer(layer.name, layer.colour, layer.strokeWidth);
            vectorLayers.push(layer.olLayer);
            map.addLayer(layer.olLayer);

            if (layers && layers[layer.name] && layers[layer.name].features) {
              var features = format.readFeatures(layers[layer.name]);
              layer.olLayer.getSource().addFeatures(features);
            }
          });

          addControlInteractions(vectorLayers, map);

          mapService.fitExtent(getExtent());
          $timeout(function() {enableDrawing = true;});
        });
      } else {
        enableDrawing = false;
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
