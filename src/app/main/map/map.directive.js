(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laMap', laMap);

  /** @ngInject */
  function laMap($log, mapService) {
    var directive = {
      priority: 2,
      restrict: 'E',
      templateUrl: 'app/main/map/map.directive.html',
      link: linkFunc,
      controller: Controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function linkFunc(scope) {
      mapService.createMap();
      scope.$on('toggle-basemap-layer', function(e, baseMap) {
        $log.debug("base map: " + baseMap);
        mapService.setBaseMap(baseMap);
      });

      scope.$on('toggle-farm-layer', function(e, layer) {
        $log.debug("farm layer:" + layer);
        mapService.toggleLayerFromCheckProperty(layer);
      });

      scope.$on('toggle-environmental-layer', function(e, layer) {
        $log.debug("environmental layer:" + layer);
        mapService.toggleLayerFromCheckProperty(layer);
      });
    }

    function Controller() {
      var vm = this;
      vm.zoomIn = mapService.zoomIn;
      vm.zoomOut = mapService.zoomOut;
      vm.toggleDrawingTool = mapService.toggleDrawingTool;
      vm.drawingTools = mapService.drawingTools;
      vm.deactivateAllDrawingTools = mapService.deactivateAllDrawingTools;
      vm.isAnyDrawingToolActive = mapService.isAnyDrawingToolActive;
    }
  }
})();
