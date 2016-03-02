(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($rootScope, $log, $location, $window, firebaseReferenceService, Firebase, loginService) {
    var vm = this;

    vm.login = login;
    vm.logout = logout;

    loginService.onceAuthData().then(_saveUserConnectedTime);

    /////////

    function login() {
      $location.path("/login");
    }

    function logout() {
      firebaseReferenceService.ref.unauth();
      $window.location.reload();
    }

    function _saveUserConnectedTime(authData) {
      vm.authData = authData;
      if (authData) {
        firebaseReferenceService.getUserInfoRef()
          .update({"connectedAt": Firebase.ServerValue.TIMESTAMP },
            function onComplete(error){
              // it failed to write. Needs to sign in again.
              if (error) {
                $log.debug(error);
                logout();
              }
            }
          );
      }
    }
  }
})();
