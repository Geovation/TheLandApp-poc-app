(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('loginService', loginService);

  /** @ngInject */
  function loginService($q, $rootScope, $location, $route, firebaseReferenceService) {
    var service = {
      isLoggedIn: isLoggedIn,
      getUid: getUid
    };

    return service;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * if the user is logged in, then get his UID and redirect to the right URL, if not redirect to the login page.
     */
    function isLoggedIn() {
      var defer = $q.defer();

      firebaseReferenceService.ref.onAuth(_checkUser);

      // $timeout(function(){
      //   // $rootScope.loaded=true;
      //   defer.resolve();
      // }, 2000);
      return defer;

      function _checkUser(authData) {
        if (authData) {
          $location.path('/user/' + firebaseReferenceService.ref.getAuth().uid);
        } else { // authData == null
          $location.path('/login');
        }

        $rootScope.loaded=true;
        defer.resolve();
      }
    } // isLoggedIn

    // the uid in the route must exist
    function getUid() {
      var uid = $route.current.params.uid;
      if (firebaseReferenceService.setUid(uid)) {
        return uid;
      } else {
        // the user doesn't exist
        $location.path('/');
      }
    }



  }

})();
