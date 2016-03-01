(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('loginService', loginService);

  /** @ngInject */
  function loginService($q, $rootScope, $location, $route, firebaseReferenceService) {
    var _authDataDefer = $q.defer();
    var service = {
      setAuthData: function(authData) {_authDataDefer.resolve(authData);},
      getAuthData: function() {return _authDataDefer.promise;},
      getUid: getUid,
      checkUser: checkUser
    };

    return service;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * if the user is logged in, then get his UID and redirect to the right URL, if not redirect to the login page.
     */
    function checkUser() {
      service.getAuthData().then(function(authData){
        if (authData) {
          $location.path('/user/' + authData.uid);
        } else { // authData == null
          $location.path('/login');
        }

        $rootScope.loaded=true;
      });
    }

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

    // function getUid() {
    //   var defer = $q.defer();
    //
    //   var uid = $route.current.params.uid;
    //   if (firebaseReferenceService.setUid(uid)) {
    //     defer.resolve(uid);
    //   } else {
    //     // the user doesn't exist
    //     defer.reject();
    //     $location.path('/');
    //   }
    //
    //   return defer;
    // }



  }

})();
