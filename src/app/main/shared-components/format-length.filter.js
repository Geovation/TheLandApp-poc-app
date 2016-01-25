(function() {
  'use strict';

  angular
    .module("LandApp")
    .filter("formatLength", formatLength);

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
