/**
 * @ngdoc service
 * @name  LandApp.service:onboardingService
 * @description
 * Manages the onboarding process and land registry title ownership.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('onboardingService', onboardingService);

  /** @ngInject */
  function onboardingService($mdDialog, $document, $log, $http, $q, $rootScope, $timeout, ENV, Firebase,
      firebaseReferenceService, firebaseLayerService, messageService,
      loginService, projectService, layerDefinitionsService, mapService, olLayerGroupService) {
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

    var _lrFeaturesChecked = false;
    var _isOnboardingCompleted = false;
    var _selectedLrFeatures = new ol.Collection();
    var _currentStepName;
    var _canCopyLrFeatures = false;
    var _stepNames = {
      homeLocation: "home-location",
      lrFeatures: "land-registry-features",
      end: "end"
    };

    return service;

    //////////////////////////// PUBLIC ////////////////////////////

    /**
     * @ngdoc method
     * @name  init
     * @methodOf LandApp.service:onboardingService
     * @description
     * Initializes the service.
     */
    function init() {
      loginService.onceAuthData().then(nextStep);

      $rootScope.$on('toggle-national-data-layer', function (e, layer) {
        if (_isOnboardingCompleted && layer.key === "lrVectors" && layer.checked) {
          _canCopyLrFeatures = true;
          mapService.setZoom(ENV.minLrDataZoom);
        }
      });
    }

    /**
     * @ngdoc method
     * @name  init
     * @methodOf LandApp.service:onboardingService
     * @description
     * Disables the adding of additional LR features
     * and toggles the owned and national LR layer data.
     */
    function finishAddingLrFeatures() {
      _canCopyLrFeatures = false;
      toggleLrLayers();
    }

    /**
     * @ngdoc method
     * @name  init
     * @methodOf LandApp.service:onboardingService
     * @description
     * Selected LR features setter.
     * @param {Ol.Collection<Ol.Feature>} selectedLrFeatures Collection of selected features
     */
    function setSelectedLrFeatures(selectedLrFeatures) {
      _selectedLrFeatures = selectedLrFeatures;
    }

    /**
     * @ngdoc method
     * @name  init
     * @methodOf LandApp.service:onboardingService
     * @description
     * Copies the currently selected (highlighted) national LR features
     * into the owned LR farm layer.
     */
    function copyLrFeaturesToFarm() {
      if (_selectedLrFeatures.getLength()) {
        var layer = olLayerGroupService.getBaseFarmLayerGroup().farmLayers.ownedLr;
        layer.olLayer.getSource().addFeatures(_selectedLrFeatures.getArray());
        firebaseLayerService.saveFarmLayers([layer])
          .then(function() {
            $log.debug("Added feature to owned LR");
            toggleLrLayers();
            _selectedLrFeatures.clear();
            nextStep();
          });
      }
      else {
        toggleLrLayers();
        nextStep();
      }
    }

    ///////////////////////// PRIVATE /////////////////////////

    /**
     * @ngdoc method
     * @name  nextStep
     * @methodOf LandApp.service:onboardingService
     * @description
     * Calculates the step to display based on the data present in the DB.
     * Assumes that the user could had have been interrupted and the user
     * needs to continue from there.
     */
    function nextStep() {
      if (!_isOnboardingCompleted) {
        firebaseReferenceService.getUserInfoRef().once("value").then(function(userInfo) {
          firebaseReferenceService.getUserFarmLayersRef().once("value").then(function(farmLayers) {
            $timeout(function(){
              if (!userInfo.val().homeBoundingBox) {
                handleStep(_stepNames.homeLocation);
              } else if (!_lrFeaturesChecked && !farmLayers.val()) {
                // check it only once everytime the user logins.
                _lrFeaturesChecked = true;
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

    /**
     * @ngdoc method
     * @name  handleStep
     * @methodOf LandApp.service:onboardingService
     * @description
     * Triggers the appropriate actions when the user
     * progresses to the next step of the onboarding process.
     */
    function handleStep(stepName) {
      _currentStepName = stepName;

      switch (_currentStepName) {
        case _stepNames.homeLocation:
          stepShowOnboardingDialog();
          break;

        case _stepNames.lrFeatures:
          if (!projectService.getMyFarmProject()) {
            projectService
              .createProject("My farm", true)
              .then(toggleLrLayers);
          } else {
            toggleLrLayers();
          }

          mapService.setZoom(ENV.minLrDataZoom);
          break;

        case _stepNames.end:
          break;
      }
    }

    /**
     * @ngdoc method
     * @name  toggleLrLayers
     * @methodOf LandApp.service:onboardingService
     * @description
     * Toggles the display of the owned and national LR data layers.
     */
    function toggleLrLayers() {
      $timeout(function() {
        var lrLayer = layerDefinitionsService.nationalDataLayers.lrVectors;
        var ownedLrLayer = (olLayerGroupService.getActiveLayerGroup() || layerDefinitionsService).farmLayers.ownedLr;

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

    /**
     * @ngdoc method
     * @name  stepCompleted
     * @methodOf LandApp.service:onboardingService
     * @description
     * Completes the onboarding process and updates the db with the current timestamp.
     */
    function stepCompleted() {
      firebaseReferenceService.getUserInfoRef().update({onboardingCompletedAt: Firebase.ServerValue.TIMESTAMP})
      .then(function(){
        $timeout(function(){
          _isOnboardingCompleted = true;
        });
      });
    }

    /**
     * @ngdoc method
     * @name  stepShowOnboardingDialog
     * @methodOf LandApp.service:onboardingService
     * @description
     * Displays the dialog shown in the first step of the onboarding process.
     */
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

        /**
         * Closes the onboarding modal allowing the user to use the map.
         */
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

        /**
         * Performs a Nominatim search based on the provided query string.
         *
         * @param  {String}  query Search string
         * @return {Promise}       Promise object
         */
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

        /**
         * Updates the internal state of the application with the user's selected address.
         *
         * @param  {String} address Address chosen by user
         */
        function selectedItemChange(address) {
          selectedAddress = address;
          $rootScope.$broadcast('address-selected', selectedAddress);
        }
      }
    }
  }
})();
