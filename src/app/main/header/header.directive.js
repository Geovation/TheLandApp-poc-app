(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laHeader', header);

  /** @ngInject */
  function header() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/header/header.html',
      controller: HeaderController,
      controllerAs: 'vmHeader',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function HeaderController($rootScope, $log) {
      var vm = this;

      vm.toggleLayersPanel = function() {
        $log.debug('toggleLayersPanel');
        $rootScope.$emit('open-layers-panel');
      };
    }
  }

})();
