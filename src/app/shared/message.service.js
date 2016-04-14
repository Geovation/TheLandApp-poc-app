/**
 * Manages the displaying and hiding of message/error dialogs.
 */
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

    ///////////////////// PUBLIC /////////////////////

    /**
     * Hides the current dialog.
     */
    function hideFn() {
      $mdDialog.hide();
    }

    /**
     * Displays the loading dialog.
     */
    function loadingFn() {
      var modalConfig = {
        templateUrl: "app/shared/loading.html",
        clickOutsideToClose: false
      };

      $mdDialog.show(modalConfig);
    }

    /**
     * Display an error dialog.
     * @param  {String} error Error text
     */
    function errorFn(error) {
      $mdDialog.hide(modalConfig);
      modalConfig = $mdDialog
        .alert()
        .title(error)
        .ok('Close');
      $mdDialog.show(modalConfig);
    }

    /**
     * Displays a standard message dialog.
     * @param  {String} message Message text
     */
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
  }
})();
