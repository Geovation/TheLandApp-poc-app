/**
 * Manages user authentication and account creation.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('loginService', loginService);

  /** @ngInject */
  function loginService($q, $log, $location, $window, $route, firebaseReferenceService, messageService) {
    var _authDataDefer = $q.defer();
    var service = {
      registerAuthData: function(authData) {_authDataDefer.resolve(authData);},
      onceAuthData: function() {return _authDataDefer.promise;},
      getRouteUid: getRouteUid,
      checkUser: checkUser,
      login: login,
      signup: signup
    };

    // if the user is not logged in then treat him/her as anonymous
    if (!firebaseReferenceService.ref.getAuth()) {
      firebaseReferenceService.ref.authAnonymously();
    }

    return service;

    //////////////////// PUBLIC ////////////////////

    /**
     * Checks if the user is logged and then redirects him/her to /#/main/UID.
     * Otherwise redirects to the login page.
     */
    function checkUser() {
      service.onceAuthData().then(function(authData){
        if (authData && !authData.anonymous) {
          $location.path('/main/' + authData.uid);
        } else {
          $location.path('/login');
        }
      });
    }

    /**
     * Ensures that there is a valid UID param in the URL.
     * If there isn't it redirects to the login page.
     *
     * @return {Promise} Promise object
     */
    function getRouteUid() {
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

    /**
     * Logs the user in based on the provided authentication credentials.
     *
     * @param  {String} email    User's email
     * @param  {String} password User's password
     */
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

    /**
     * Creates a new account for the user and logs him/her in.
     *
     * @param  {String} email    User's email
     * @param  {String} password User's password
     */
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
