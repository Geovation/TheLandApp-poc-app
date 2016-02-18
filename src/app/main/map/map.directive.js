(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laMap', laMap);

  /** @ngInject */
  function laMap($log, ol,
      drawingToolsService, layerDefinitionsService, mapService, olExternalLayerService, onboardingService, olUserLayerService) {

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
      mapService.init();
      drawingToolsService.init();
      olUserLayerService.init();

      // build and cache all layers
      angular.forEach(layerDefinitionsService, function(layerList, layerListName) {
        // drawingLayers layers are build in the drawing tool.
        if (layerListName !== 'drawingLayers') {
          angular.forEach(layerList, olExternalLayerService.addLayerAndInteractions);
        }
      });

      scope.$on('la-fitExtent', function() {
        mapService.fitExtent(olUserLayerService.getExtent());
      });

      scope.$on('toggle-drawing-tool-layer', function(e, layer) {
        drawingToolsService.setVisibleDrawingToolLayer(layer);
      });

      scope.$on('toggle-basemap-layer', function(e, baseMap) {
        $log.debug("base map: " + baseMap.name);
        mapService.setBaseMap(baseMap);
      });

      scope.$on('toggle-farm-layer', function(e, layer) {
        $log.debug("farm layer:" + layer);
        mapService.toggleLayerFromCheckProperty(layer);
      });

      scope.$on('toggle-national-data-layer', function(e, layer) {
        $log.debug("national data layer:" + layer);
        mapService.toggleLayerFromCheckProperty(layer);
      });

      scope.$on('toggle-environmental-layer', function(e, layer) {
        $log.debug("environmental layer:" + layer);
        mapService.toggleLayerFromCheckProperty(layer);
      });

      scope.$on("address-selected", function(e, address) {
        if (address) {
          var coord1 = ol.proj.fromLonLat([+address.boundingbox[2], +address.boundingbox[0]]);
          var coord2 = ol.proj.fromLonLat([+address.boundingbox[3], +address.boundingbox[1]]);
          var extent = ol.extent.boundingExtent([coord1, coord2]);
          mapService.fitExtent(extent);
        }
      });

    }

    function Controller() {
      var vm = this;
      vm.editToggleDrawingTool = drawingToolsService.editToggleDrawingTool;
      vm.deactivateAllDrawingTools = drawingToolsService.deactivateAllDrawingTools;
      vm.drawingLayers = drawingToolsService.drawingLayers;
      vm.isDrawingEnabled = isDrawingEnabled;
      vm.isAnyDrawingToolActive = drawingToolsService.isAnyDrawingToolActive;
      vm.isOnboardingCompleted = onboardingService.isOnboardingCompleted;

      ///////////////////////////////
      function isDrawingEnabled() {
        return olUserLayerService.layersCreated && onboardingService.isOnboardingCompleted();
      }

    }
  }
})();
