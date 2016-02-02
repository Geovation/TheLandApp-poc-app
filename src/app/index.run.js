(function() {
  'use strict';

  angular
    .module('LandApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $log, ENV, ga, firebaseService) {
    $rootScope.ENV = ENV;

    ga('create', ENV.gaKey, 'auto');
    ga('send', 'pageview');

    firebaseService.ref.onAuth(setGAUserID);

    $log.debug('runBlock end');

    //////////
    function setGAUserID(authData) {
      var uid = authData ? authData.uid : null;
      $log.debug("GA userId : " + uid);
      ga('set', 'userId', uid);
      if (uid) {
        ga('send', {
          hitType: 'event',
          eventCategory: 'User',
          eventAction: 'login',
          eventLabel: authData.password.email
        });
      }
    }
  }

})();
