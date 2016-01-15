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

      vm.feature = {
        title: ""
      };

      $rootScope.$on("toggle-feature-panel", function(event, featureList) {
        var selectedFeature = featureList[0],
            panel = $mdSidenav("feature-panel");

        if (!selectedFeature) {
          panel.close();
        } else {
          panel.open();
        }
      });
    }
  }

})();
