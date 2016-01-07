(function() {
  'use strict';

  angular
    .module('LandApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $log, ENV) {
    $rootScope.ENV = ENV;
    $log.debug('runBlock end');
  }

})();
