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
      olUserLayerService, featureMeasureService, layerDefinitionsService,
      mapService, projectTagService, firebaseLayerService) {
      var vm = this;
      var activeFeature;
      var activeFeatureParentLayer;
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
          olUserLayerService.removeFeature(activeFeature);
          panel.close();
        });
      };

      vm.performTagSearch = function(query) {
        return projectTagService.findMatchingTags(query);
      };

      vm.saveFeatureData = function(featureTitle) {
        if (featureTitle) {
          vm.featureData.title = featureTitle;
        }

        activeFeature.set("featureData", vm.featureData);

        if (activeFeatureParentLayer.key === "ownedLr") {
          firebaseLayerService.saveFarmLayers([activeFeatureParentLayer]);
        } else {
          firebaseLayerService.saveDrawingLayers([activeFeatureParentLayer]);
        }

        vm.lastSaveTime = Date.now();
      };

      $rootScope.$on("toggle-feature-panel", function(ngEvent, selectEvent) {
        panel = $mdSidenav("feature-panel");

        if (selectEvent.selected.length) {
          activeFeature = selectEvent.selected[0];
          activeFeatureParentLayer = olUserLayerService.getLayerDetailsByFeature(activeFeature);

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
          featureType: activeFeatureParentLayer.name,
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
