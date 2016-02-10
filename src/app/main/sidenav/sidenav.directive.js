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
    function SidenavController(ol,
        $log, $mdSidenav, $rootScope,
        firebaseReferenceService, layerDefinitionsService) {
      var vm = this;

      vm.environmentalLayers = layerDefinitionsService.environmentalLayers;
      vm.baseMapLayers = layerDefinitionsService.baseMapLayers;
      vm.farmLayers = layerDefinitionsService.farmLayers;
      vm.basemap = vm.baseMapLayers["Open Street Map"];
      vm.drawingLayers = layerDefinitionsService.drawingLayers;
      vm.nationalDataLayers = layerDefinitionsService.nationalDataLayers;

      firebaseReferenceService.ref.onAuth(activateAndLoadUserFarmLayers);
      /////////////////////

      function activateAndLoadUserFarmLayers(authData) {
        if (authData) {
          // TODO: the same data is read in drawing-tool.service. Find a way to
          // do it once.
          firebaseReferenceService.getUserLayersRef().once("value", function(userLayers) {
            $log.debug(userLayers);

            var layers = userLayers.val();
            var format = new ol.format.GeoJSON();

            // populate farmLayers with Open Layers vector layers.
            var vectorLayers = [];

            angular.forEach(vm.farmLayers, function(farmLayer){
              farmLayer.olLayer = _newVectorLayer(farmLayer.name, farmLayer.strokeColor, farmLayer.fillColor);
              vectorLayers.push(farmLayer.olLayer);

              if (layers && layers[farmLayer.key] && layers[farmLayer.key].features) {
                var features = format.readFeatures(layers[farmLayer.key]);
                farmLayer.olLayer.getSource().addFeatures(features);
              }
            });

            // TODO: any interaction to be added ?
            //addControlInteractions(vectorLayers, map);

            // enable the directive
            $rootScope.$broadcast('toggle-basemap-layer', vm.basemap);

            $rootScope.$on('open-layers-panel', function() {
              $mdSidenav('layers-sidenav').toggle();
            });
          });
        }
      } //activateAndLoadUserFarmLayers

      function _newVectorLayer(name, strokeColor, fillColor ) {
        return new ol.layer.Vector({
          source: new ol.source.Vector({}),
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: fillColor
            }),
            stroke: new ol.style.Stroke({
              color: strokeColor
            })
          })
        });
      } // _newVectorLayer
    } // SidenavController
  } // sidenav


})();
