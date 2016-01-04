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

      vm.basemap = 'Open Street Map';
      vm.environmentalLayers = layersService.environmentalLayers;
      vm.baseMapLayers = layersService.baseMapLayers;
      vm.farmLayers = layersService.farmLayers;

      $rootScope.$on('open-layers-panel', function() {
        $mdSidenav('layers-sidenav').toggle();
      });

      vm.toggleFarmLayer = function(layer) {
        $rootScope.$emit('toggle-farm-layer', layer);
      };

      vm.toggleEnvironmentalLayer = function(layer) {
        $rootScope.$emit('toggle-environmental-layer', layer);
      };

      vm.toggleBaseMapLayer = function() {
        $rootScope.$emit('toggle-basemap-layer', vm.basemap);
      };

    }
  }

})();
