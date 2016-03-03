(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('onboardingService', onboardingService);

  /** @ngInject */
  function onboardingService($mdDialog, $document, $log, $http, $q, $rootScope, $timeout, ENV, Firebase,
      firebaseReferenceService, firebaseLayerService, messageService, loginService, projectService, layerDefinitionsService, mapService) {
    var service = {
      init: init,
      setSelectedLrFeatures: setSelectedLrFeatures,
      copyLrFeaturesToFarm: copyLrFeaturesToFarm,
      stepCompleted: stepCompleted,
      finishAddingLrFeatures: finishAddingLrFeatures,
      isOnboardingCompleted: function() { return _isOnboardingCompleted; },
      getCurrentStepName: function() { return _currentStepName; },
      canCopyLrFeatures: function() { return _canCopyLrFeatures; }
    };

    var _isOnboardingCompleted = false;
    var _selectedLrFeatures = [];
    var _currentStepName;
    var _canCopyLrFeatures = false;
    var _stepNames = {
      homeLocation: "home-location",
      lrFeatures: "land-registry-features",
      end: "end"
    };

    return service;

    // PUBLIC //////////////////////////////////////////////////////////////////
    function init() {
      loginService.onceAuthData().then(nextStep);
      projectService.init();

      $rootScope.$on('toggle-national-data-layer', function (e, layer) {
        if (_isOnboardingCompleted && layer.key === "lrVectors" && layer.checked) {
          _canCopyLrFeatures = true;
          mapService.setZoom(ENV.minLrDataZoom);
        }
      });
    }

    /**
     * Disables the adding of additional LR features
     * and toggles the owned and national LR layer data.
     */
    function finishAddingLrFeatures() {
      _canCopyLrFeatures = false;
      toggleLrLayers();
    }

    /**
     * Selected LR features setter.
     * @param {Ol.Collection<Ol.Feature>} selectedLrFeatures Collection of selected features
     */
    function setSelectedLrFeatures(selectedLrFeatures) {
      _selectedLrFeatures = selectedLrFeatures;
    }

    /**
     * Copies the currently selected (highlighted) national LR features
     * into the owned LR farm layer.
     */
    function copyLrFeaturesToFarm() {
      var layer = layerDefinitionsService.farmLayers.ownedLr;
      layer.olLayer.getSource().addFeatures(_selectedLrFeatures.getArray());
      firebaseLayerService.saveFarmLayers([layer])
        .then(function() {
          $log.debug("Added feature to owned LR");
          toggleLrLayers();
          _selectedLrFeatures.clear();
          nextStep();
        });
    }

    // PRIVATE /////////////////////////////////////////////////////////////////
    /* It calculates the step to display based on the data present in the DB.
     * It assumes that the user could had have been interrupted and the user
     * needs to continue from there.
     */
    function nextStep() {
      if (!_isOnboardingCompleted) {
        firebaseReferenceService.getUserInfoRef().once("value").then(function(userInfo) {
          firebaseReferenceService.getUserFarmLayersRef().once("value").then(function(farmLayers) {
            $timeout(function(){
              if (!userInfo.val().homeBoundingBox) {
                handleStep(_stepNames.homeLocation);
              } else if (!farmLayers.val()) {
                handleStep(_stepNames.lrFeatures);
              } else if (!userInfo.val().onboardingCompletedAt){
                handleStep(_stepNames.end);
              } else {
                _isOnboardingCompleted = true;
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
          if (!projectService.getBaseFarmProject()) {
            projectService.createProject("My farm", true);
          }

          mapService.setZoom(ENV.minLrDataZoom);
          toggleLrLayers();
          break;

        case _stepNames.end:
          stepEnd();
          break;
      }
    }

    /**
     * Toggles the display of the owned and national LR data layers.
     */
    function toggleLrLayers() {
      $timeout(function() {
        var lrLayer = layerDefinitionsService.nationalDataLayers.lrVectors;
        var ownedLrLayer = layerDefinitionsService.farmLayers.ownedLr;

        if (_isOnboardingCompleted) {
          // when adding additional LR titles, always show the owned LR layer
          // and only show the national LR layer if we can copy
          ownedLrLayer.checked = true;
          lrLayer.checked = _canCopyLrFeatures;
        } else {
          // when going through onboarding, toggle by
          // alternating the owned LR and national LR layers
          ownedLrLayer.checked = lrLayer.checked;
          lrLayer.checked = !lrLayer.checked;
        }

        $rootScope.$broadcast('toggle-farm-layer', ownedLrLayer);
        $rootScope.$broadcast('toggle-national-data-layer', lrLayer);
      });
    }

    function stepEnd() {

    }

    function stepCompleted() {
      firebaseReferenceService.getUserInfoRef().update({onboardingCompletedAt: Firebase.ServerValue.TIMESTAMP})
      .then(function(){
        $timeout(function(){
          _isOnboardingCompleted = true;
        });
      });
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
