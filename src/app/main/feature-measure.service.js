(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('featureMeasureService', featureMeasureService);

  /** @ngInject */
  function featureMeasureService() {
    var service = {
      calculateArea: calculateArea,
      calculateLength: calculateLength,
      getPrettyMeasurement: getPrettyMeasurement
    };

    var wgs84Sphere = new ol.Sphere(6378137);

    return service;

    //////////////

    function getPrettyMeasurement(geometry, sourceProjection) {
      var output = angular.element("<span>");

      if (geometry instanceof ol.geom.Polygon) {
        var area = calculateArea(geometry, sourceProjection);

        if (area > 10000) {
          output.text(Math.round(area / 1000000 * 100) / 100 + " km");
        } else {
          output.text(Math.round(area * 100) / 100 + " m");
        }

        output.append(angular.element("<sup>").text("2"));
      } else if (geometry instanceof ol.geom.LineString) {
        var length = calculateLength(geometry, sourceProjection);

        if (length > 1000) {
          output.text(Math.round(length / 1000 * 100) / 100 + " km");
        } else {
          output.text(Math.round(length * 100) / 100 + " m");
        }
      }

      return output;
    }

    function calculateArea(polygon, sourceProjection) {
      var geometry = polygon.clone().transform(sourceProjection, "EPSG:4326");
      var coordinates = geometry.getLinearRing(0).getCoordinates();

      return Math.abs(wgs84Sphere.geodesicArea(coordinates));
    }

    function calculateLength(line, sourceProjection) {
      var length = 0;

      line.getCoordinates().forEach(function(coordinate, index, coordinates) {
        if (coordinates.length === index + 1) {
          return;
        }

        var c1 = ol.proj.transform(coordinate, sourceProjection, "EPSG:4326");
        var c2 = ol.proj.transform(coordinates[index + 1], sourceProjection, "EPSG:4326");

        length += wgs84Sphere.haversineDistance(c1, c2);
      });

      return length;
    }
  }
})();
