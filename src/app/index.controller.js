(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($log, $window, firebaseReferenceService, Firebase) {
    var vm = this;

    vm.login = login;
    vm.logout = logout;

    firebaseReferenceService.ref.onAuth(_saveUserConnectedTime);

    /////////

    function login() {
      $window.location.href = "/login";
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
