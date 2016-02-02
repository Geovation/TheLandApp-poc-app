(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($log, $document, $mdDialog, $timeout,
      firebaseService, Firebase, onboardingService) {
    var vm = this;

    var modalConfig;

    vm.login = login;
    vm.signup = signup;
    vm.logout = logout;

    firebaseService.ref.onAuth(saveUserConnectedTime);

    onboardingService.showOnboardingDialog();

    /////////

    function saveUserConnectedTime(authData) {
      vm.authData = authData;
      if (authData) {
        firebaseService.getUserInfoRef()
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

      firebaseService.ref.createUser({email:vm.email, password:vm.password})
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

      firebaseService.ref.authWithPassword({email: vm.email, password: vm.password})
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
      firebaseService.ref.unauth();
      vm.authData = null;
    }
  }
})();
