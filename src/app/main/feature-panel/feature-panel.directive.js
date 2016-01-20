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
    function FeaturePanelController($rootScope, $mdSidenav, $mdDialog, mapService) {
      var vm = this;
      var activeFeature;
      var panel;

      vm.featureData = {};

      vm.addAttribute = function() {
        if (!angular.isArray(vm.featureData.attributes)) {
          vm.featureData.attributes = [];
        }

        vm.featureData.attributes.push({name: "", value: ""});
      };

      vm.removeFeature = function() {
        var confirm = $mdDialog.confirm()
          .title("Are you sure you want to remove this layer?")
          .content("This action cannot be undone and will remove all associated layer data.")
          .ariaLabel("Remove layer")
          .ok("Remove layer")
          .cancel("Cancel");

        $mdDialog.show(confirm).then(function() {
          mapService.removeFeature(activeFeature);
          panel.close();
        });
      };

      vm.saveFeatureData = function() {
        activeFeature.set("featureData", vm.featureData);

        mapService.saveDrawingLayers();

        vm.lastSaveTime = Date.now();
      };

      $rootScope.$on("toggle-feature-panel", function(ngEvent, selectEvent) {
        panel = $mdSidenav("feature-panel");

        if (selectEvent.selected.length) {
          activeFeature = selectEvent.selected[0];
          vm.featureData = activeFeature.get("featureData") || {};

          panel.open();
        } else {
          panel.close();
        }
      });
    }
  }

})();
