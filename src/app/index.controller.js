(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($log, $firebaseAuth, $mdDialog, Firebase) {
    var vm = this;

    //TODO: externalize it
    var firebaseRef = new Firebase("https://the-land-app-indigo.firebaseio.com");
    var auth = $firebaseAuth(firebaseRef);
    var modalMessage;

    vm.login = login;
    vm.signup = signup;
    vm.logout = logout;
    vm.authData = auth.$getAuth();

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

      auth.$createUser({email:vm.email, password:vm.password})
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

      auth.$authWithPassword({email: vm.email, password: vm.password})
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
      auth.$unauth();
      vm.authData = null;
    }
  }
})();
