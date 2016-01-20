(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('layerInteractionsService', layerInteractionsService);

  /** @ngInject */
  function layerInteractionsService(ol, $log) {
    var service = {
      buildVectorSpace: buildVectorSpace
    };

    return service;
    ////////////////

    function buildVectorSpace(osLayer) {
      var select = new ol.interaction.Select({
       condition: ol.events.condition.click,
       layers: [osLayer]
      });

      select.on('select', function(e) {
        // if (e.selected.length - e.deselected.length > 0) { DO STUFF}
        $log.debug(e);
      });

      return select;
    }

  }
})();
