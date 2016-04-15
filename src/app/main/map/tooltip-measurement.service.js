/**
 * @ngdoc service
 * @name  LandApp.service:tooltipMeasurementService
 * @description
 * Sets up and controls the measurement tooltips that appear
 * when drawing new features on the map.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('tooltipMeasurementService', tooltipMeasurementService);

  /** @ngInject */
  function tooltipMeasurementService(ol, featureMeasureService, mapService) {
    var service = {
      addTooltip: addTooltip
    };

    var measureTooltipNode;
    var measureTooltip;
    var currentFeature;

    return service;

    //////////////////////////// PUBLIC FUNCTIONS ////////////////////////////

    /**
     * @ngdoc method
     * @name  addTooltip
     * @methodOf LandApp.service:tooltipMeasurementService
     * @description
     * Adds a new tooltip and binds it to the draw interaction's events.
     * @param {ol.interaction.Draw} drawInteraction Draw interaction instance
     */
    function addTooltip(drawInteraction) {
      createMeasureTooltip();
      addDrawListeners(drawInteraction);
    }

    //////////////////////////// PRIVATE FUNCTIONS ////////////////////////////

    /**
     * @ngdoc method
     * @name  createMeasureTooltip
     * @methodOf LandApp.service:tooltipMeasurementService
     * @description
     * Creates the tooltip overlay and adds it to the map.
     */
    function createMeasureTooltip() {
      if (measureTooltipNode) {
        measureTooltipNode.remove();
      }

      measureTooltipNode = angular.element("<div>").addClass("tooltip tooltip-measure");
      measureTooltip = new ol.Overlay({
        element: measureTooltipNode[0],
        offset: [0, -15],
        positioning: "bottom-center",
        stopEvent: false
      });

      mapService.getMap().addOverlay(measureTooltip);
    }

    /**
     * @ngdoc method
     * @name  addDrawListeners
     * @methodOf LandApp.service:tooltipMeasurementService
     * @description
     * Adds a drawstart callback to the draw interaction which
     * displays the feature's length/area within the tooltip.
     * @param {ol.interaction.Draw} drawInteraction Draw interaction instance
     */
    function addDrawListeners(drawInteraction) {
      var listener;

      drawInteraction.on("drawstart", function(event) {
        var tooltipCoord = event.coordinate;

        currentFeature = event.feature;

        listener = currentFeature.getGeometry().on("change", function(event) {
          var geometry = event.target;
          var output = featureMeasureService.getPrettyMeasurement(geometry, mapService.getMap().getView().getProjection());

          if (geometry instanceof ol.geom.Polygon) {
            tooltipCoord = geometry.getInteriorPoint().getCoordinates();
          } else if (geometry instanceof ol.geom.LineString) {
            tooltipCoord = geometry.getLastCoordinate();
          }

          measureTooltipNode.empty().append(output);
          measureTooltip.setPosition(tooltipCoord);
        });
      });

      drawInteraction.on("drawend", function() {
        measureTooltipNode.remove();

        currentFeature = undefined;
        measureTooltipNode = undefined;

        createMeasureTooltip();
        ol.Observable.unByKey(listener);
      });
    }
  }
})();
