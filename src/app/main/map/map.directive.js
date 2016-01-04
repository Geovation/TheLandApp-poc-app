(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laMap', laMap);

  /** @ngInject */
  function laMap() {
    var directive = {
      priority: 2,
      restrict: 'E',
      templateUrl: 'app/main/map/map.directive.html',
      controller: MapController,
      controllerAs: 'vm',
      bindToController: true
    };

    var vm,
        that = {};

    return directive;

    /** @ngInject */
    function MapController($rootScope, $scope, $log, mapService) {
      vm = this;
      that.scope = $scope;
      that.mapService = mapService;

      createMap();
      mapService.addBaseMaps(that.map);

      watchFarmLayerChange();

      $log.log(that.mapService.map.enabledFarmLayers);
    }

    function watchFarmLayerChange() {
      var foo = that.mapService;

      that.scope.$watchCollection('that.mapService.map.enabledFarmLayers', function(newLayers, oldLayers) {
        console.log(that.mapService.map.enabledFarmLayers, newLayers, oldLayers);
      });
    }

    function createMap() {
      var timsFarm = ol.proj.fromLonLat([-0.658493, 51.191286]);
      var jamesFarm = ol.proj.fromLonLat([-1.315305, 51.324901]);

      that.view = new ol.View({
        center: jamesFarm,
        maxZoom: 20,
        minZoom: 7,
        zoom: 13
      });

      vm.zoomIn = function() {
        that.view.setZoom(that.view.getZoom() + 1);
      };

      vm.zoomOut = function() {
        that.view.setZoom(that.view.getZoom() - 1);
      };

      that.map = new ol.Map({
        target: 'map',
        layers: [], // initialise without any layers because land-app-map-controller will set basemap
        loadTilesWhileAnimating: true,
        view: that.view,
        controls: []
      });

      //this.scope.map.addInteraction(clickHandler);
    }
  }
})();
