(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('onboardingService', onboardingService);

  /** @ngInject */
  function onboardingService($mdDialog, $document, $log, $http, $q, $rootScope, $timeout, ENV,
      firebaseReferenceService, firebaseLayerService, messageService, layerDefinitionsService, mapService) {
    var service = {
      init: init,
      handleLrFeatureSelect: handleLrFeatureSelect,
      copyLrFeaturesToFarm: copyLrFeaturesToFarm,
      stepCompleted: stepCompleted,
      isOnboardingCompleted: function() {
        return _isOnboardingCompleted;
      },
      getCurrentStepName: function() {
        return _currentStepName;
      },
      getSelectedLrFeatureAmount: function() {
        return _selectedLrFeatures.length;
      }
    };

    var _isOnboardingCompleted = false;
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
      var layer = layerDefinitionsService.farmLayers.ownedLr;
      layer.olLayer.getSource().addFeatures(_selectedLrFeatures);
      firebaseLayerService.saveFarmLayers([layer])
        .then(function() {
          $log.debug("Added feature to owned LR");
          toggleLrLayers();
          nextStep();
        });
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
            $timeout(function(){
              if (!userInfo.val().homeBoundingBox) {
                handleStep(_stepNames.homeLocation);
              } else if (!farmLayers.val()) {
                handleStep(_stepNames.lrFeatures);
              } else {
                handleStep(_stepNames.end);
              }
            });
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
          mapService.setZoom(ENV.minLrDataZoom);
          toggleLrLayers();
          break;

        case _stepNames.end:
          stepEnd();
          break;
      }
    }

    function toggleLrLayers() {
      $timeout(function() {
        var lrLayer = layerDefinitionsService.nationalDataLayers.lrVectors;
        var ownedLrLayer = layerDefinitionsService.farmLayers.ownedLr;

        ownedLrLayer.checked = lrLayer.checked;
        lrLayer.checked = !lrLayer.checked;

        $rootScope.$broadcast('toggle-environmental-layer', lrLayer);
        $rootScope.$broadcast('toggle-farm-layer', ownedLrLayer);
      });
    }

    function stepEnd() {

    }

    function stepCompleted() {
      _isOnboardingCompleted = true;
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
