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

    // $rootScope.loaded = false;
    //
    // $rootScope.$on('$routeChangeStart', function() {
    //   $rootScope.loaded = false;
    // });
    //
    // $rootScope.$on('$routeChangeSuccess', function() {
    //   $rootScope.loaded = true;
    // });
    //
    // $rootScope.$on('$routeChangeError', function(err) {
    //   $log.error(err);
    //   $rootScope.loaded = true;
    // });


    $log.debug('runBlock end');

    //////////
    function _initServices(authData) {
      loginService.setAuthData(authData);
      _setGAUserID(authData);
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
