(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseReferenceService', firebaseReferenceService);

  /** @ngInject */
  function firebaseReferenceService(Firebase, ENV) {
    var firebaseRef = new Firebase("https://" + ENV.firebase + ".firebaseio.com");
    var _uid = null;
    var service = {
      ref: firebaseRef,
      getUserInfoRef: getUserInfoRef,
      getUserDrawingLayersRef: getUserDrawingLayersRef,
      getUserFarmLayersRef: getUserFarmLayersRef,
      getUserUIDRef: getUserUIDRef,
      setUid: setUid
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

    function getUserUIDRef(uid) {
      uid = uid || _uid || firebaseRef.getAuth().uid;
      return firebaseRef
        .child("users")
        .child(uid);
    }

    function setUid(uid) {
      _uid = uid;
      debugger
      // TODO: return null (or exception) if the user doesn't exist. It must return a promise.
      return _uid;
    }
  }

})();
