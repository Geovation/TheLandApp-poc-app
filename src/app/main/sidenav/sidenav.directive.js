(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laSidenav', sidenav);

  /** @ngInject */
  function sidenav() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/sidenav/sidenav.html',
      controller: SidenavController,
      controllerAs: 'vmSidenav'
    };

    return directive;

    /** @ngInject */
    function SidenavController(ENV, $mdSidenav, $rootScope, $timeout, layerDefinitionsService, olLayerGroupService) {
      var vm = this;

      vm.environmentalLayers = layerDefinitionsService.environmentalLayers;
      vm.baseMapLayers = layerDefinitionsService.baseMapLayers;
      vm.farmLayers = layerDefinitionsService.farmLayers;
      vm.basemap = vm.baseMapLayers[ENV.defaultBaseMap];
      vm.drawingLayers = layerDefinitionsService.drawingLayers;
      vm.nationalDataLayers = layerDefinitionsService.nationalDataLayers;

      $rootScope.$watch(olLayerGroupService.getActiveLayerGroup, function() {
        if (olLayerGroupService.getActiveLayerGroup()) {
          vm.farmLayers = olLayerGroupService.getActiveLayerGroup().farmLayers;
          vm.drawingLayers = olLayerGroupService.getActiveLayerGroup().drawingLayers;

          // TODO: move this somewhere more appropriate
          angular.forEach(vm.farmLayers, function(farmLayer) {
            farmLayer.checked = false;
          });
        }
      });

      // enable the directive
      $rootScope.$broadcast('toggle-basemap-layer', vm.basemap);

      $rootScope.$on('open-layers-panel', function() {
        $mdSidenav('layers-sidenav').toggle();
      });
    } // SidenavController
  } // sidenav


})();
