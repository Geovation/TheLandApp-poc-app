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
    function FeaturePanelController(ol, $rootScope, $mdSidenav, $mdDialog,
      userLayerService, featureMeasureService, layerDefinitionsService,
      mapService, projectTagService, firebaseLayerService) {
      var vm = this;
      var activeFeature;
      var panel;

      vm.featureData = {};

      vm.addAttribute = function() {
        vm.featureData.attributes.push({name: "", value: ""});
      };

      vm.removeFeature = function() {
        var confirm = $mdDialog.confirm()
          .title("Are you sure you want to remove this feature?")
          .content("This action cannot be undone and will remove all associated feature data.")
          .ariaLabel("Remove feature")
          .ok("Remove feature")
          .cancel("Cancel");

        $mdDialog.show(confirm).then(function() {
          userLayerService.removeFeature(activeFeature);
          panel.close();
        });
      };

      vm.performTagSearch = function(query) {
        return projectTagService.findMatchingTags(query);
      };

      vm.saveFeatureData = function(featureTitle) {
        var parentLayer = userLayerService.getLayerDetailsByFeature(activeFeature);

        if (featureTitle) {
          vm.featureData.title = featureTitle;
        }

        activeFeature.set("featureData", vm.featureData);

        if (parentLayer.key === "ownedLr") {
          firebaseLayerService.saveFarmLayers([parentLayer]);
        } else {
          firebaseLayerService.saveDrawingLayers([parentLayer]);
        }

        vm.lastSaveTime = Date.now();
      };

      $rootScope.$on("toggle-feature-panel", function(ngEvent, selectEvent) {
        panel = $mdSidenav("feature-panel");

        if (selectEvent.selected.length) {
          activeFeature = selectEvent.selected[0];

          vm.readOnlyData = compileReadOnlyData();
          vm.featureData = angular.extend({
            title: "",
            attributes: [],
            tags: []
          }, activeFeature.get("featureData"));

          panel.open();
        } else {
          panel.close();
        }
      });

      $rootScope.$watch(function() {
        return $mdSidenav("feature-panel").isOpen();
      }, function(isOpen, wasOpen) {
        if (!isOpen && wasOpen) {
          vm.saveFeatureData();
          vm.lastSaveTime = undefined;
        }
      });

      function compileReadOnlyData() {
        var data = {
          area: undefined,
          length: undefined,
          featureType: userLayerService.getLayerDetailsByFeature(activeFeature).name,
          featureProperties: activeFeature.getProperties()
        };

        var geometry = activeFeature.getGeometry();

        if (geometry instanceof ol.geom.Polygon) {
          data.area = featureMeasureService.calculateArea(geometry, mapService.getProjection());
        } else if (geometry instanceof ol.geom.LineString) {
          data.length = featureMeasureService.calculateLength(geometry, mapService.getProjection());
        }

        return data;
      }
    }
  }

})();
