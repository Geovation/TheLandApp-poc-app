(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('onboardingService', onboardingService);

  /** @ngInject */
  function onboardingService($mdDialog, $document, $log, $http, $q, $rootScope, $timeout,
      firebaseReferenceService, firebaseLayerService, messageService, layerDefinitionsService) {

    var service = {
      init: init,
      handleLrFeatureSelect: handleLrFeatureSelect,
      copyLrFeaturesToFarm: copyLrFeaturesToFarm,
      isOnboardingCompleted: false,
      getCurrentStepName: function() {
        return _currentStepName;
      },
      getSelectedLrFeatureAmount: function() {
        return _selectedLrFeatures.length;
      }
    };

    var _selectedLrFeatures = [];
    var _currentStepName;
    var _stepNames = {
      homeLocation: "home-location",
      lrFeatures: "land-registry-features",
      end: "end"
    };

    return service;

    // PUBLIC //////////////////////////////////////////////////////////////////
    function init() {
      firebaseReferenceService.ref.onAuth(nextStep);
    }

    function handleLrFeatureSelect(selectedLrFeatures) {
      if (_currentStepName === _stepNames.lrFeatures) {
        _selectedLrFeatures = selectedLrFeatures;
      }
    }

    function copyLrFeaturesToFarm() {
      var layer = layerDefinitionsService.farmLayers["Owned LR"];
      layer.olLayer.getSource().addFeatures(_selectedLrFeatures);
      firebaseLayerService.saveFarmLayers([layer]);
      $log.debug("Added feature to owned LR");

      // clear selection here!
      toggleLrLayers();

      handleStep(_stepNames.end);
    }

    // PRIVATE /////////////////////////////////////////////////////////////////
    /* It calculates the step to display based on the data present in the DB.
     * It assumes that the user could had have been interrupted and the user
     * needs to continue from there.
     */
    function nextStep() {
      if (firebaseReferenceService.ref.getAuth()) {
        firebaseReferenceService.getUserInfoRef().once("value").then(function(userInfo) {
          firebaseReferenceService.getUserFarmLayersRef().once("value").then(function(farmLayers) {
            if (!userInfo.val().homeBoundingBox) {
              handleStep(_stepNames.homeLocation);
            } else if (!farmLayers.val()) {
              handleStep(_stepNames.lrFeatures);
            } else {
              handleStep(_stepNames.end);
            }
          });
        });
      }
    }

    function handleStep(stepName) {
      _currentStepName = stepName;

      switch (_currentStepName) {
        case _stepNames.homeLocation:
          stepShowOnboardingDialog();
          break;

        case _stepNames.lrFeatures:
          toggleLrLayers();
          break;

        case _stepNames.end:
          stepEnd();
          break;
      }
    }

    function toggleLrLayers() {
      $timeout(function() {
        var layer = layerDefinitionsService.nationalDataLayers["LR Vectors"];
        layer.checked = !layer.checked;
        $rootScope.$broadcast('toggle-environmental-layer', layer)
      });
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
