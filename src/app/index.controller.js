(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($q, $log, $location, $window, firebaseReferenceService, Firebase, loginService) {
    var vm = this;

    vm.login = login;
    vm.logout = logout;

    loginService.onceAuthData().then(_healUserData);

    /////////

    function login() {
      $location.path("/login");
    }

    function logout() {
      firebaseReferenceService.ref.unauth();
      $window.location.reload();
    }

    function _healUserData(authData) {
      vm.authData = authData;

      if (authData) {
        _saveUserConnectedTime(authData)
          .then(_writeUserEmail)
          .catch(function(error) {
            $log.debug(error);
            logout();
          });
      }

      function _writeUserEmail() {
        return firebaseReferenceService.getUserInfoRef()
          .update({"email": authData.password.email});
      }

      function _saveUserConnectedTime() {
        return firebaseReferenceService.getUserInfoRef()
         .update({"connectedAt": Firebase.ServerValue.TIMESTAMP });
      }
    } //_healUserData
  }
})();
