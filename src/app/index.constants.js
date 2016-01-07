/* global ol:false, proj4:false, Firebase*/
(function() {
  'use strict';

// TODO: parametrize the firebase name.

  angular
    .module('LandApp')
    .constant('ol', ol)
    .constant('proj4', proj4)
    .constant('Firebase', Firebase);

})();
