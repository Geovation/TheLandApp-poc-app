(function() {
  'use strict';

  angular
    .module('LandApp', ['ngResource', 'ngRoute', 'ngMaterial', 'firebase', 'xeditable'])
    .run(function(editableThemes) {
      editableThemes.default.submitTpl = '<button type="submit"><i class="fa fa-check"></i></button>';
      editableThemes.default.cancelTpl = '<button type="button" ng-click="$form.$cancel()"><i class="fa fa-times"></i></button>';
      editableThemes.default.formTpl = '<form class="editable-wrap md-toolbar-tools"></form>';
    });

})();
