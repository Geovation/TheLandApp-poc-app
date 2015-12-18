(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laHeader', header);

  /** @ngInject */
  function header() {
    var directive = {
      priority: 1,
      restrict: 'E',
      templateUrl: 'app/main/header/header.html',
      controller: HeaderController,
      controllerAs: 'vmMap',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function HeaderController($rootScope, $log) {
      var vmMap = this;

      vmMap.toggleLayersPanel = function() {
        $log.debug('toggleLayersPanel');
        $rootScope.$emit('open-layers-panel');
      };
    }
  }

})();
