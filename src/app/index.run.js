(function() {
  'use strict';

  angular
    .module('LandApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $log, ENV, ga, firebaseReferenceService, loginService) {
    $rootScope.ENV = ENV;

    ga('create', ENV.gaKey, 'auto');
    ga('send', 'pageview');

    firebaseReferenceService.ref.onAuth(_initServices);

    $log.debug('runBlock end');

    //////////
    function _initServices(authData) {
      loginService.registerAuthData(authData);
      _setGAUserID(authData);

      // TODO: move it in the right places
      $rootScope.loaded=true;
    }

    function _setGAUserID(authData) {
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
