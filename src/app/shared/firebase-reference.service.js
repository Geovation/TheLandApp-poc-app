(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseReferenceService', firebaseReferenceService);

  /** @ngInject */
  function firebaseReferenceService(Firebase, ENV) {
    var firebaseRef = new Firebase("https://" + ENV.firebase + ".firebaseio.com");
    var service = {
      ref: firebaseRef,
      getUserInfoRef: getUserInfoRef,
      getUserDrawingLayersRef: getUserDrawingLayersRef,
      getUserFarmLayersRef: getUserFarmLayersRef,
      getUserProjectsRef: getUserProjectsRef
    };

    return service;
    ////////// public functions //////////////

    function getUserInfoRef() {
      return getUserUIDRef()
        .child("info");
    }

    function getUserProjectsRef() {
      return getUserUIDRef()
        .child("projects");
    }

    function getUserDrawingLayersRef() {
      return getUserUIDRef()
        .child("projects/myFarm/drawing");
    }

    function getUserFarmLayersRef() {
      return getUserUIDRef()
        .child("projects/myFarm/land");
    }

    //////////// privates ////////////////
    function getUserUIDRef() {
      var uid = firebaseRef.getAuth().uid;
      return firebaseRef
        .child("users")
        .child(uid);
    }
  }

})();
