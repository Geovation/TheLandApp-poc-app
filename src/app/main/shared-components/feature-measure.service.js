/**
 * Calculates geometry sizes (length or area) depending on their type.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('featureMeasureService', featureMeasureService);

  /** @ngInject */
  function featureMeasureService(ol, $filter) {
    var service = {
      calculateArea: calculateArea,
      calculateLength: calculateLength,
      getPrettyMeasurement: getPrettyMeasurement
    };

    var _wgs84Sphere = new ol.Sphere(6378137);

    return service;

    ///////////////////// PUBLIC /////////////////////

    /**
     * Calculates and formats the area/length of a geometry.
     *
     * @param  {ol.geom.SimpleGeometry} geometry         Geometry to measure
     * @param  {ol.proj.ProjectionLike} sourceProjection Source projection
     * @return {jQuery|jqLite}                           HTML element wrapped in a jQuery/jqLite object
     */
    function getPrettyMeasurement(geometry, sourceProjection) {
      var output = angular.element("<span>");

      if (geometry instanceof ol.geom.Polygon) {
        var area = calculateArea(geometry, sourceProjection);

        output.html($filter('formatArea')(area));
      } else if (geometry instanceof ol.geom.LineString) {
        var length = calculateLength(geometry, sourceProjection);

        output.html($filter('formatLength')(length));
      }

      return output;
    }

    /**
     * Calculates the area of a polygon.
     *
     * @param  {ol.geom.Polygon}        polygon          Geometry to measure
     * @param  {ol.proj.ProjectionLike} sourceProjection Source projection
     * @return {number}                                  Geodesic area in square meters
     */
    function calculateArea(polygon, sourceProjection) {
      var geometry = polygon.clone().transform(sourceProjection, "EPSG:4326");
      var coordinates = geometry.getLinearRing(0).getCoordinates();

      return Math.abs(_wgs84Sphere.geodesicArea(coordinates));
    }

    /**
     * Calculates the length of a line using the haversine formula.
     *
     * @param  {ol.geom.LineString}     polygon          Geometry to measure
     * @param  {ol.proj.ProjectionLike} sourceProjection Source projection
     * @return {number}                                  Length in meters
     */
    function calculateLength(line, sourceProjection) {
      var length = 0;

      line.getCoordinates().forEach(function(coordinate, index, coordinates) {
        if (coordinates.length === index + 1) {
          return;
        }

        var c1 = ol.proj.transform(coordinate, sourceProjection, "EPSG:4326");
        var c2 = ol.proj.transform(coordinates[index + 1], sourceProjection, "EPSG:4326");

        length += _wgs84Sphere.haversineDistance(c1, c2);
      });

      return length;
    }
  }
})();
