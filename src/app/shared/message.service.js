(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('messageService', messageService);

  /** @ngInject */
  function messageService($document, $mdDialog) {
    var modalConfig;

    var service = {
      error: errorFn,
      message: messageFn,
      loading: loadingFn,
      hide: hideFn
    };

    return service;
    ////////// public functions //////////////

    function hideFn() {
      $mdDialog.hide();
    }

    function loadingFn() {
      var modalConfig = {
        templateUrl: "app/shared/loading.html",
        clickOutsideToClose:false
      };
      $mdDialog.show(modalConfig);
    }

    function errorFn(error) {
      $mdDialog.hide(modalConfig);
      modalConfig = $mdDialog
        .alert()
        .title(error)
        .ok('Close');
      $mdDialog.show(modalConfig);
    }

    function messageFn(message) {
      modalConfig = {
        parent: angular.element($document.body),
        template:
          '<md-dialog>' +
          '  <md-dialog-content>' +
          '    <md-content layout-padding layout="column">' +
          '      <p flex>' + message + '</p>' +
          '      <md-progress-linear flex md-mode="indeterminate"></md-progress-linear>' +
          '    </md-content>' +
          '  </md-dialog-content>' +
          '  <md-dialog-actions>' +
          '  </md-dialog-actions>' +
          '</md-dialog>'
      };

      $mdDialog.show(modalConfig);
    }


    //////////// privates ////////////////

  }

})();
