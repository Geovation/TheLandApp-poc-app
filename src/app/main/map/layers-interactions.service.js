(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('layerInteractionsService', layerInteractionsService);

  /** @ngInject */
  function layerInteractionsService(ol, $log, $rootScope, drawingToolsService, $timeout) {
    var service = {
      buildVectorSpace: buildVectorSpace
    };

    return service;
    ////////////////

    function buildVectorSpace(layer) {
      var click = new ol.interaction.Select({
        condition: function (e) {
          return ol.events.condition.click(e) && !drawingToolsService.isAnyDrawingToolActive();
        },
        layers: [layer.olLayer]
      });

      click.on('select', function() {
        $timeout(function() {
          $rootScope.$broadcast('land-registry-features-selected', click.getFeatures().getArray());
        });
      });

      return [click];
    }

  }
})();
