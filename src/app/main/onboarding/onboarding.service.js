(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('onboardingService', onboardingService);

  /** @ngInject */
  function onboardingService($mdDialog, $document, $log, $http, $q, $rootScope,
      firebaseReferenceService, messageService) {

    var service = {
      init: init,
      isOnboardingCompleted: false
    };

    return service;

    // PUBLIC //////////////////////////////////////////////////////////////////
    function init() {
      firebaseReferenceService.ref.onAuth(nextStep);
    }

    // PRIVATE /////////////////////////////////////////////////////////////////
    /* It calculates the step to display based on the data present in the DB.
     * It assumes that the user could had have been interrupted and the user
     * needs to continue from there.
     */
    function nextStep() {
      if (firebaseReferenceService.ref.getAuth()) {
        firebaseReferenceService.getUserInfoRef().once("value").then(function(userInfo) {
          if (!userInfo.val().homeBoundingBox) {
            stepShowOnboardingDialog();
          // } else if (next step condition) {
          //   stepNext();
          } else {
            stepEnd();
          }
        });
      }
    }

    function stepEnd() {
      service.isOnboardingCompleted = true;
    }

    function stepShowOnboardingDialog() {
      $mdDialog.show({
        templateUrl: 'app/main/onboarding/onboarding-dialog.html',
        parent: angular.element($document.body),
        controllerAs: 'vmDialog',
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: DialogController
      });

      function DialogController($scope, $mdDialog) {
        var vm = this;
        var selectedAddress;
        vm.continueMapping = continueMapping;
        vm.querySearch = querySearch;
        vm.selectedItemChange = selectedItemChange;

        /////////////////////////////////////////////////////////////////////////
        function continueMapping() {
          if (selectedAddress) {
            firebaseReferenceService.getUserInfoRef().update({
              homeBoundingBox: selectedAddress.boundingbox
            })
            .then(function() {
              $mdDialog.hide();
              nextStep();
            })
            .catch(function(error) {
              $log.error("Update error:", error);
              messageService.error(error.message);
            });
          }
        }

        // returns a promise as it is async.
        function querySearch(query) {
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

        function selectedItemChange(address) {
          selectedAddress = address;
          $rootScope.$broadcast('address-selected', selectedAddress);
        }
      } // DialogController

    } // stepShowOnboardingDialog

  }
})();
