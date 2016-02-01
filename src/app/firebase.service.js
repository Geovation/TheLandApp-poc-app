(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseService', firebaseService);

  /** @ngInject */
  function firebaseService($firebaseAuth, Firebase, ENV) {
    var firebaseRef = new Firebase("https://" + ENV.firebase + ".firebaseio.com");
    var service = {
      auth : $firebaseAuth(firebaseRef),
      getUserInfoRef : getUserInfoRef,
      getUserLayersRef : getUserLayersRef
    };

    return service;
    ////////// public functions //////////////

    function getUserInfoRef() {
      return getUserUIDRef()
        .child("info");
    }

    function getUserLayersRef() {
      return getUserUIDRef()
        .child("layers");
    }

    //////////// privates ////////////////
    function getUserUIDRef() {
      var uid = service.auth.$getAuth().uid;
      return firebaseRef
        .child("users")
        .child(uid);
    }
  }

})();
