(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laMap', laMap);

  /** @ngInject */
  function laMap() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/map.directive.html',
      controller: MapController,
      controllerAs: 'vm'
    };

    return directive;

    /** @ngInject */
    function MapController($rootScope, $log) {
      var vm = this;

      createMap();

      vm.zoomIn = function() {

      };

      vm.zoomOut = function() {

      };

    }


    function createMap() {
      var self = this;

      var timsFarm = ol.proj.fromLonLat(<ol.Coordinate>[-0.658493, 51.191286]);
      var jamesFarm = ol.proj.fromLonLat(<ol.Coordinate>[-1.315305, 51.324901]);

      this.view = new ol.View({
          center: jamesFarm,
          maxZoom: 20,
          minZoom: 7,
          zoom: 13
      });

      this.scope.zoomIn = function() {
          self.view.setZoom(self.view.getZoom() + 1);
      };

      this.scope.zoomOut = function() {
          self.view.setZoom(self.view.getZoom() - 1);
      };

      this.scope.map = new ol.Map(<olx.MapOptions>{
          target: 'map',
          layers: [], // initialise without any layers because land-app-map-controller will set basemap
          loadTilesWhileAnimating: true,
          view: self.view,
          controls: []
      });

      var self = this;

      //this.scope.map.addInteraction(clickHandler);
    }

  }

})();
