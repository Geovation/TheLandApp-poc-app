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
    }

    function _writeUserEmail(authData) {
      var deferred = $q.defer();

      firebaseReferenceService.getUserInfoRef()
        .update({"email": authData.password.email },
        function onComplete(error){
          // it failed to write. Needs to sign in again.
          if (error) {
            deferred.reject(authData);
          } else {
            deferred.resolve(authData);
          }
        }
      );

      deferred.resolve(authData);
      return deferred.promise;
    }

    function _saveUserConnectedTime(authData) {
      var deferred = $q.defer();

      // TODO: can I replace it with
      // return firebaseReferenceService.getUserInfoRef()
      // .update({"connectedAt": Firebase.ServerValue.TIMESTAMP });

      firebaseReferenceService.getUserInfoRef()
        .update({"connectedAt": Firebase.ServerValue.TIMESTAMP },
          function onComplete(error){
            // it failed to write. Needs to sign in again.
            if (error) {
              deferred.reject(authData);
            } else {
              deferred.resolve(authData);
            }
          }
        );

      return deferred.promise;
    }
  }
})();
