(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($log, $mdDialog, firebaseService) {
    var vm = this;

    var modalMessage;

    vm.login = login;
    vm.signup = signup;
    vm.logout = logout;
    vm.authData = firebaseService.auth.$getAuth();

    /////////
    function showError(error) {
      $mdDialog.hide(modalMessage);
      modalMessage = $mdDialog.alert({
        title: error,
        ok: 'Close'
      });
      $mdDialog.show( modalMessage );
    }

    function showMessage(message) {
      modalMessage = $mdDialog.alert({
        title: message
      });
      $mdDialog.show( modalMessage );
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
      showMessage("Loging in");

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
