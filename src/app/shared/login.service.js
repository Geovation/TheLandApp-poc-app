(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('loginService', loginService);

  /** @ngInject */
  function loginService($q, $rootScope, $log, $location, $window, $route, firebaseReferenceService, messageService) {
    var _authDataDefer = $q.defer();
    var service = {
      registerAuthData: function(authData) {_authDataDefer.resolve(authData);},
      onceAuthData: function() {return _authDataDefer.promise;},
      getUid: getUid,
      checkUser: checkUser,
      login: login,
      signup: signup
    };

    return service;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * if the user is logged in, then get his UID and redirect to the right URL, if not redirect to the login page.
     */
    function checkUser() {
      service.onceAuthData().then(function(authData){
        if (authData) {
          $location.path('/main/' + authData.uid);
        } else { // authData == null
          $location.path('/login');
        }
      });
    }

    // the uid in the route must exist
    function getUid() {
      var deferred = $q.defer();

      var uid = $route.current.params.uid;
      firebaseReferenceService.setUid(uid)
        .then(function() {
          deferred.resolve(uid);
        })
        .catch(function(e){
          deferred.reject(e);
          $location.path("/");
        });

      return deferred.promise;
    }

    function login(email, password) {
      messageService.message("Logging you in...");

      firebaseReferenceService.ref.authWithPassword({email: email, password: password})
        .then(function(authData) {
          $log.debug("Logged in as:", authData.uid);
          $window.location.href = "/";
        }).catch(function(error) {
        $log.error("Error: ", error);
        messageService.error(error.message);
      });
    }

    function signup(email, password) {
      messageService.message("Signing up");

      firebaseReferenceService.ref.createUser({email:email, password:password})
        .then(function(userData) {
          $log.debug("User " + userData.uid + " created successfully!");
          login(email, password);
        }).catch(function(error) {
        $log.debug("Error: ", error);
        messageService.error(error.message);
      });
    }

  }

})();
