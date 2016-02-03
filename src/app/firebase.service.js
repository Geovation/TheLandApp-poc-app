(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseService', firebaseService);

  /** @ngInject */
  function firebaseService(Firebase, ENV) {
    var firebaseRef = new Firebase("https://" + ENV.firebase + ".firebaseio.com");
    var service = {
      ref: firebaseRef,
      getUserInfoRef: getUserInfoRef,
      getUserLayersRef: getUserLayersRef
    };

    return service;
    ////////// public functions //////////////

    function getUserInfoRef() {
      return getUserUIDRef() ? getUserUIDRef().child("info") : null;
    }

    function getUserLayersRef() {
      return getUserUIDRef() ? getUserUIDRef().child("layers") : null;
    }

    //////////// privates ////////////////
    function getUserUIDRef() {
      var auth = firebaseRef.getAuth();
      var userUIDRef = null;
      if (auth) {
        userUIDRef = firebaseRef
          .child("users")
          .child(auth.uid)
      }
      return userUIDRef;
    }
  }

})();
