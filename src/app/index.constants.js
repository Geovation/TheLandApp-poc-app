/* global ol:false, proj4:false, Firebase, ga, window*/
(function() {
  'use strict';

  // mocking ga for the tests
  if (!window.ga) {
    window.ga = {};
  }

  angular
    .module('LandApp')
    .constant('ol', ol)
    .constant('proj4', proj4)
    .constant('Firebase', Firebase)
    .constant('ga', ga);

})();
