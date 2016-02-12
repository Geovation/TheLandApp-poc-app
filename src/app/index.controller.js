(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController(Firebase, $log, $mdDialog, $timeout,
      firebaseReferenceService, messageService) {
    var vm = this;

    vm.login = login;
    vm.signup = signup;
    vm.logout = logout;

    firebaseReferenceService.ref.onAuth(saveUserConnectedTime);

    /////////

    function saveUserConnectedTime(authData) {
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
              $timeout(function(){vm.loaded = true;});
            }
          );
      } else { // authData == null
        $timeout(function(){vm.loaded = true;});
      }
    }

    function signup() {
      messageService.message("Signing up");

      firebaseReferenceService.ref.createUser({email:vm.email, password:vm.password})
      .then(function(userData) {
        $log.debug("User " + userData.uid + " created successfully!");
        login();
      }).catch(function(error) {
        $log.debug("Error: ", error);
        messageService.error(error.message);
      });
    }

    function login() {
      messageService.message("Logging you in...");

      firebaseReferenceService.ref.authWithPassword({email: vm.email, password: vm.password})
      .then(function(authData) {
        $log.debug("Logged in as:", authData.uid);
        vm.authData = authData;
        $mdDialog.hide();
      }).catch(function(error) {
        $log.error("Error: ", error);
        messageService.error(error.message);
      });
    }

    function logout() {
      firebaseReferenceService.ref.unauth();
      vm.authData = null;
    }
  }
})();
