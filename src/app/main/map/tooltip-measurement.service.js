(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('tooltipMeasurementService', tooltipMeasurementService);

  /** @ngInject */
  function tooltipMeasurementService() {
    var service = {
      addTooltip: addTooltip
    };

    return service;

    //////////////

    var measureTooltipNode;
    var measureTooltip;
    var currentFeature;

    function addTooltip(layer, drawInteraction) {
      createMeasureTooltip(drawInteraction.getMap());

      addDrawListeners(drawInteraction);
    }

    function createMeasureTooltip(map) {
      if (measureTooltipNode) {
        measureTooltipNode.remove();
      }

      measureTooltipNode = angular.element("<div>").addClass("tooltip tooltip-measure");
      measureTooltip = new ol.Overlay({
        element: measureTooltipNode[0],
        offset: [0, -15],
        positioning: "bottom-center"
      });

      map.addOverlay(measureTooltip);
    }

    function addDrawListeners(drawInteraction) {
      var listener;

      drawInteraction.on("drawstart", function(event) {
        var tooltipCoord = event.coordinate;

        currentFeature = event.feature;

        listener = currentFeature.getGeometry().on("change", function(event) {
          var geometry = event.target;
          var output;

          if (geometry instanceof ol.geom.Polygon) {
            output = formatArea(geometry);
            tooltipCoord = geometry.getInteriorPoint().getCoordinates();
          } else if (geometry instanceof ol.geom.LineString) {
            output = formatLength(geometry);
            tooltipCoord = geometry.getLastCoordinate();
          }

          measureTooltipNode.empty().append(output);
          measureTooltip.setPosition(tooltipCoord);
        });
      });

      drawInteraction.on("drawend", function(event) {
        measureTooltipNode.removeClass("tooltip-measure").addClass("tooltip-static");
        measureTooltip.setOffset([0, -7]);

        currentFeature = undefined;
        measureTooltipNode = undefined;

        createMeasureTooltip();
        ol.Observable.unByKey(listener);
      });
    }

    function formatArea(polygon) {
      var area = polygon.getArea();
      var output = angular.element("<span>");

      if (area > 10000) {
        output.text(Math.round(area / 1000000 * 100) / 100 + " km");
      } else {
        output.text(Math.round(area * 100) / 100 + " m");
      }

      output.append(angular.element("<sup>").text("2"));

      return output;
    }

    function formatLength(line) {
      var length = Math.round(line.getLength() * 100) / 100;
      var output = angular.element("<span>");

      if (length > 1000) {
        output.text(Math.round(length / 1000 * 100) / 100 + " km");
      } else {
        output.text(Math.round(length * 100) / 100 + " m");
      }

      return output;
    }
  }
})();
