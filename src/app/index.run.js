(function() {
  'use strict';

  angular
    .module('LandApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $log, ENV, ga, firebaseReferenceService, loginService, editableThemes) {
    $rootScope.ENV = ENV;

    ga('create', ENV.gaKey, 'auto');
    ga('send', 'pageview');

    editableThemes.default.submitTpl = '<button type="submit"><i class="fa fa-check"></i></button>';
    editableThemes.default.cancelTpl = '<button type="button" ng-click="$form.$cancel()"><i class="fa fa-times"></i></button>';
    editableThemes.default.formTpl = '<form class="editable-wrap md-toolbar-tools"></form>';

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
      var uid = (authData  && !authData.anonymous) ? authData.uid : null;
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
