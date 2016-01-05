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


    // function MapController($rootScope, $scope, $log, mapService) {
    //   var vm = this;
    //   that.scope = $scope;
    //   that.mapService = mapService;
    //
    //   createMap();
    //   mapService.addBaseMaps(that.map);
    //
    //   watchFarmLayerChange();
    //
    //   $log.log(that.mapService.map.enabledFarmLayers);
    // }

    // function watchFarmLayerChange() {
    //   var foo = that.mapService;
    //
    //   that.scope.$watchCollection('that.mapService.map.enabledFarmLayers', function(newLayers, oldLayers) {
    //     console.log(that.mapService.map.enabledFarmLayers, newLayers, oldLayers);
    //   });
    // }

    // function createMap() {
    //   var timsFarm = ol.proj.fromLonLat([-0.658493, 51.191286]);
    //   var jamesFarm = ol.proj.fromLonLat([-1.315305, 51.324901]);
    //
    //   that.view = new ol.View({
    //     center: jamesFarm,
    //     maxZoom: 20,
    //     minZoom: 7,
    //     zoom: 13
    //   });
    //
    //   vm.zoomIn = function() {
    //     that.view.setZoom(that.view.getZoom() + 1);
    //   };
    //
    //   vm.zoomOut = function() {
    //     that.view.setZoom(that.view.getZoom() - 1);
    //   };
    //
    //   that.map = new ol.Map({
    //     target: 'map',
    //     layers: [], // initialise without any layers because land-app-map-controller will set basemap
    //     loadTilesWhileAnimating: true,
    //     view: that.view,
    //     controls: []
    //   });
    //
    //   //this.scope.map.addInteraction(clickHandler);
    // }
  }
})();
