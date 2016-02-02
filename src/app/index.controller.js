(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController($log, $document, $mdDialog, $timeout, $http, $q, $rootScope,
      firebaseService, Firebase) {
    var vm = this;

    var modalConfig;

    vm.login = login;
    vm.signup = signup;
    vm.logout = logout;

    firebaseService.ref.onAuth(saveUserConnectedTime);

    showOnboardingDialog();

    /////////

    function showOnboardingDialog() {
      firebaseService.getUserInfoRef().once("value").then(function(userInfo) {
        if (!userInfo.homeCoordinates) {
          $mdDialog.show({
            templateUrl: 'app/main/tour/onboarding-dialog.html',
            parent: angular.element($document.body),
            clickOutsideToClose: true,
            controllerAs: 'vmDialog',
            controller: function($scope, $mdDialog) {
              var vm = this;

              vm.continue = function() {
                $mdDialog.hide();
              };

              vm.selectedItemChange = function(address) {
                if (address) {
                  firebaseService.getUserInfoRef().update({
                    homeCoordinates: {
                      lat: address.lat,
                      lon: address.lon,
                      boundingBox: address.boundingbox
                    }
                  }).then(function() {
                    $rootScope.$broadcast('address-selected', address);
                  }).catch(function(e) {
                    // TODO: add error handling
                    $log.error("Update error:", e);
                  });
                }
              }

              // returns a promise as it is async.
              vm.querySearch = function(query) {
                $log.debug("Query search:" + query);

                var url = "https://nominatim.openstreetmap.org/search";
                var defer = $q.defer();

                $http.get(url, {params:{format:"json", q:query, countrycodes:"gb"}})
                  .then(
                    function successCallback(response){
                      defer.resolve(response.data);
                    },
                    function errorCallback(response){
                      defer.reject(response);
                    }
                  );

                return defer.promise;
              }
            }
          });
        }
      });
    }

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
