(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController(Firebase, $log, $timeout, $window,
                           firebaseReferenceService, messageService) {
    var vm = this;

    vm.login = login;
    vm.signup = signup;

    /////////

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
          $window.location.href = "/";
        }).catch(function(error) {
        $log.error("Error: ", error);
        messageService.error(error.message);
      });
    }
    
  }
})();
