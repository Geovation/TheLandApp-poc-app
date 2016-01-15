(function() {
  'use strict';

  angular
    .module('LandApp', ['ngResource', 'ngRoute', 'ngMaterial', 'firebase', 'xeditable'])
    .run(function(editableOptions) {
      editableOptions.theme = 'default';
    });

})();
