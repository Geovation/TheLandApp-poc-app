(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('layerInteractionsService', layerInteractionsService);

  /** @ngInject */
  function layerInteractionsService(ol, $mdDialog, $log, drawingToolsService) {
    var service = {
      buildVectorSpace: buildVectorSpace
    };

    return service;
    ////////////////

    function buildVectorSpace(layer) {
      var hover = new ol.interaction.Select({
       condition: ol.events.condition.pointerMove,
       layers: [layer.olLayer],
       filter: function() { return !drawingToolsService.isAnyDrawingToolActive();}
      });

      var click = new ol.interaction.Select({
       //condition: ol.events.condition.click,
       condition: function (e) {return ol.events.condition.click(e) && !drawingToolsService.isAnyDrawingToolActive();},
       layers: [layer.olLayer],
       // OL bug: the next filter is it is not working
       // filter: function() { return !drawingToolsService.isAnyDrawingToolActive();} // OL bug: it is not working
      });

      click.on('select', function(e) {
        var features = layer.olLayer.getSource().getFeaturesAtCoordinate(e.mapBrowserEvent.coordinate);
        if (features.length) {
          var dialogAddFeature = $mdDialog.confirm()
            .title('Add this LR feature to your farm ?')
            .textContent('It will be added in the form of hendges and you will be able to edit it.')
            .cancel('Ops, sorry...')
            .ok('Sure, do it');
          $mdDialog.show(dialogAddFeature).then(function() {
            drawingToolsService.addFeaturesToDrawingLayer("Boundaries", features);
            $log.debug("Added feature from LR ");
          });
        }
      });

      return [hover, click];
    }

  }
})();
