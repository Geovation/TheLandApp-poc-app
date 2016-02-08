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
      var layers = layerDefinitionsService.getLayerDefinitons();

      vm.environmentalLayers = layers.environmentalLayers;
      vm.baseMapLayers = layers.baseMapLayers;
      vm.farmLayers = layers.farmLayers;
      vm.basemap = vm.baseMapLayers[0];
      vm.drawingLayers = layers.drawingLayers;
      vm.nationalDataLayers = layers.nationalDataLayers;

      $rootScope.$broadcast('toggle-basemap-layer', vm.basemap);

      $rootScope.$on('open-layers-panel', function() {
        $mdSidenav('layers-sidenav').toggle();
      });
    }
  }

})();
