(function() {
  'use strict';

  angular
    .module('LandApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $log, ENV, ga, firebaseService) {
    $rootScope.ENV = ENV;
    firebaseService.firebaseRef.onAuth(setGAUserID);

    $log.debug('runBlock end');

    //////////
    function setGAUserID(authData) {
      $log.debug("GA userId : " + authData.uid);
      ga('set', 'userId', authData.uid);
    }
  }

})();
