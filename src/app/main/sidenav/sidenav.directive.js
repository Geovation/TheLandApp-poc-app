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
    function SidenavController($rootScope, $mdSidenav, layerDefinitionsService) {
      var vm = this;

      vm.environmentalLayers = layerDefinitionsService.environmentalLayers;
      vm.baseMapLayers = layerDefinitionsService.baseMapLayers;
      vm.farmLayers = layerDefinitionsService.farmLayers;
      vm.basemap = vm.baseMapLayers[0];
      vm.drawingLayers = layerDefinitionsService.drawingLayers;
      vm.nationalDataLayers = layerDefinitionsService.nationalDataLayers;

      $rootScope.$broadcast('toggle-basemap-layer', vm.basemap);

      $rootScope.$on('open-layers-panel', function() {
        $mdSidenav('layers-sidenav').toggle();
      });
    }
  }

})();
