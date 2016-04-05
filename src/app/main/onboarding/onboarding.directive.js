(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laOnboarding', laOnboarding);

  /** @ngInject */
  function laOnboarding(onboardingService) {

    var directive = {
      priority: 2,
      restrict: 'E',
      templateUrl: 'app/main/onboarding/onboarding.html',
      controller: Controller,
      controllerAs: 'vmOnboarding',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function Controller() {
      var vm = this;
      vm.getCurrentStepName = onboardingService.getCurrentStepName;
      vm.copyLrFeaturesToFarm = onboardingService.copyLrFeaturesToFarm;
      vm.isOnboardingCompleted = onboardingService.isOnboardingCompleted;
      vm.stepCompleted = onboardingService.stepCompleted;
      vm.canCopyLrFeatures = onboardingService.canCopyLrFeatures;
      vm.finishAddingLrFeatures = onboardingService.finishAddingLrFeatures;

      onboardingService.init();
    }
  }
})();
