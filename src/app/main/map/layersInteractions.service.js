(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('layerInteractionsService', layerInteractionsService);

  /** @ngInject */
  function layerInteractionsService(ol, $mdDialog, $log) {
    var service = {
      buildVectorSpace: buildVectorSpace
    };

    return service;
    ////////////////

    function buildVectorSpace(map, drawingLayers, olLayer) {
      var hover = new ol.interaction.Select({
       condition: ol.events.condition.pointerMove,
       layers: [olLayer]
      });

      var click = new ol.interaction.Select({
       condition: ol.events.condition.click,
       layers: [olLayer]
      });

      click.on('select', function(e) {
        var features = olLayer.getSource().getFeaturesAtCoordinate(e.mapBrowserEvent.coordinate);
        if (features.length) {
          var dialogAddFeature = $mdDialog.confirm()
            .title('Add this LR feature to your farm ?')
            .textContent('It will be added in the form of hendges and you will be able to edit it.')
            .cancel('Ops, sorry...')
            .ok('Sure, do it');
          $mdDialog.show(dialogAddFeature).then(function(){
            drawingLayers.Hedge.getSource().addFeatures(features);
            // TODO: save
            debugger;
            $log.debug("Added feature from LR ");
          });
        }
      });

      return [hover, click];
    }

  }
})();
