(function() {
  'use strict';

  angular
    .module("landAppFilters", [])
    .filter("formatArea", formatArea)
    .filter("formatLength", formatLength);

  /** @ngInject */
  function formatArea($sce) {
    return function(area) {
      if (area > 10000) {
        area = Math.round(area / 1000000 * 100) / 100 + " km";
      } else {
        area = Math.round(area * 100) / 100 + " m";
      }

      area += "<sup>2</sup>";

      return $sce.trustAsHtml(area);
    };
  }

  /** @ngInject */
  function formatLength($sce) {
    return function(length) {
      if (length > 1000) {
        length = Math.round(length / 1000 * 100) / 100 + " km";
      } else {
        length = Math.round(length * 100) / 100 + " m";
      }

      return $sce.trustAsHtml(length);
    };
  }

})();
