(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laFeaturePanel', featurePanel);

  /** @ngInject */
  function featurePanel() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/feature-panel/feature-panel.html',
      controller: FeaturePanelController,
      controllerAs: 'vmPanel'
    };

    return directive;

    /** @ngInject */
    function FeaturePanelController($rootScope, $mdSidenav) {
      var vm = this;

      vm.featureData = {};

      vm.addAttribute = function() {
        if (!angular.isArray(vm.featureData.attributes)) {
          vm.featureData.attributes = [];
        }

        vm.featureData.attributes.push({name: "", value: ""});
      };

      var prevSelectedFeature;

      $rootScope.$on("toggle-feature-panel", function(ngEvent, selectEvent) {
        var selectedFeature = selectEvent.selected[0],
            panel = $mdSidenav("feature-panel");

        if (selectedFeature) {
          panel.open();
          prevSelectedFeature = selectedFeature;
          vm.featureData = selectedFeature.get("featureData") || {};
        } else {
          if (prevSelectedFeature) {
            prevSelectedFeature.set("featureData", vm.featureData);
          }

          panel.close();
        }
      });
    }
  }

})();
