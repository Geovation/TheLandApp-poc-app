(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('onboardingService', onboardingService);

  /** @ngInject */
  function onboardingService(firebaseService, $mdDialog, $document, $log, $http, $q, $rootScope) {
    var isOnboardingCompleted;

    var service = {
      showOnboardingDialog: showOnboardingDialog,
      isOnboardingCompleted: function() {return isOnboardingCompleted;}
    };

    return service;

    /////////////////////

    function showOnboardingDialog() {
      firebaseService.getUserInfoRef().once("value").then(function(userInfo) {
        var selectedAddress;

        if (userInfo.val().homeBoundingBox) {
          isOnboardingCompleted = true;
        } else {
          $mdDialog.show({
            templateUrl: 'app/main/onboarding/onboarding-dialog.html',
            parent: angular.element($document.body),
            clickOutsideToClose: true,
            controllerAs: 'vmDialog',
            clickOutsideToClose: false,
            escapeToClose: false,
            controller: function($scope, $mdDialog) {
              var vm = this;

              vm.continue = function() {
                if (selectedAddress) {
                  firebaseService.getUserInfoRef().update({
                    homeBoundingBox: selectedAddress.boundingbox
                  })
                  .then(function() {
                    isOnboardingCompleted = true;
                    $mdDialog.hide();
                  })
                  .catch(function(e) {
                    // TODO: add error handling
                    $log.error("Update error:", e);
                  });
                }
              };

              vm.selectedItemChange = function(address) {
                selectedAddress = address;
                $rootScope.$broadcast('address-selected', selectedAddress);
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
  }
})();
