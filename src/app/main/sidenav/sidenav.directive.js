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
    function SidenavController($rootScope, $mdSidenav, layersService) {
      var vm = this;

      vm.environmentalLayers = layersService.environmentalLayers;
      vm.baseMapLayers = layersService.baseMapLayers;
      vm.farmLayers = layersService.farmLayers;
      vm.basemap = vm.baseMapLayers[0];
      vm.drawingLayers = layersService.drawingLayers;
      vm.publicDataLayers = layersService.publicDataLayers;

      $rootScope.$broadcast('toggle-basemap-layer', vm.basemap);

      $rootScope.$on('open-layers-panel', function() {
        $mdSidenav('layers-sidenav').toggle();
      });
    }
  }

})();
