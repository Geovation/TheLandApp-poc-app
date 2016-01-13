(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($log, $document, $mdDialog, firebaseService) {
    var vm = this;

    var modalConfig;

    vm.login = login;
    vm.signup = signup;
    vm.logout = logout;
    vm.authData = firebaseService.auth.$getAuth();

    /////////
    function showError(error) {
      $mdDialog.hide(modalConfig);
      modalConfig = $mdDialog
        .alert()
        .title(error)
        .ok('Close');
      $mdDialog.show(modalConfig);
    }

    function showMessage(message) {
      // modalConfig = $mdDialog
      //   .alert()
      //   .title(message);
      // $mdDialog.show(modalConfig);

      $mdDialog.show({
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
      });
    }

    function signup() {
      showMessage("Signing up");

      firebaseService.auth.$createUser({email:vm.email, password:vm.password})
      .then(function(userData) {
        $log.debug("User " + userData.uid + " created successfully!");
        login();
      }).catch(function(error) {
        $log.debug("Error: ", error);
        showError(error.message);
      });
    }

    function login() {
      showMessage("Logging you in...");

      firebaseService.auth.$authWithPassword({email: vm.email, password: vm.password})
      .then(function(authData) {
        $log.debug("Logged in as:", authData.uid);
        vm.authData = authData;
        $mdDialog.hide();
      }).catch(function(error) {
        $log.error("Error: ", error);
        showError(error.message);
      });
    }

    function logout() {
      firebaseService.auth.$unauth();
      vm.authData = null;
    }
  }
})();
