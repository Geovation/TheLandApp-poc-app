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
      getUserFarmLayersRef: getUserFarmLayersRef
    };

    return service;
    ////////// public functions //////////////

    function getUserInfoRef() {
      return getUserUIDRef()
        .child("info");
    }

    function getUserDrawingLayersRef() {
      return getUserUIDRef()
        .child("layers/drawing");
    }

    function getUserFarmLayersRef() {
      return getUserUIDRef()
        .child("layers/farm");
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
