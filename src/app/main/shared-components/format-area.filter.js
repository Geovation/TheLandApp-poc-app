(function() {
  'use strict';

  angular
    .module("LandApp")
    .filter("formatArea", formatArea);

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
})();
