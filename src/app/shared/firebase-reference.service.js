(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseReferenceService', firebaseReferenceService);

  /** @ngInject */
  function firebaseReferenceService($q, Firebase, ENV) {
    var firebaseRef = new Firebase("https://" + ENV.firebase + ".firebaseio.com");
    var _uid = null;
    var _projectKeys = {};
    var service = {
      ref: firebaseRef,
      getUserInfoRef: getUserInfoRef,
      getUserDrawingLayersRef: getUserDrawingLayersRef,
      getUserFarmLayersRef: getUserFarmLayersRef,
      getUserUIDRef: getUserUIDRef,
      setUid: setUid,
      getUserProjectsRef: getUserProjectsRef,

      setActiveProjectKey: setActiveProjectKey,
      setBaseFarmProjectKey: setBaseFarmProjectKey
    };

    return service;
    ////////// public functions //////////////

    function getUserInfoRef(uid) {
      return getUserUIDRef(uid)
        .child("info");
    }

    function getUserProjectsRef(uid) {
      return getUserUIDRef(uid)
        .child("projects");
    }

    function getUserDrawingLayersRef(uid) {
      return getUserProjectsRef(uid)
        .child(_projectKeys.activeProject)
        .child("layers/drawing");
    }

    function getUserFarmLayersRef(uid) {
      return getUserProjectsRef(uid)
        .child("myFarm/layers/farm");
    }

    function getUserUIDRef(uid) {
      uid = uid || _uid || (firebaseRef.getAuth() && firebaseRef.getAuth().uid);
      return firebaseRef
        .child("users")
        .child(uid);
    }

    function setActiveProjectKey(key) {
      _projectKeys.activeProject = key;
    }

    function setBaseFarmProjectKey(key) {
      _projectKeys.baseFarmProject = key;
    }

    /**
     * Set the current UID. It verifies that the UID is stored in the DB. If it is not, it is an unexisting user and
     * therefore it reject it.
     *
     * @param uid
     * @returns {promise} which will be resolved if it succeed and rejected if it there is not any user with that UID.
     */
    function setUid(uid) {
      var deferred = $q.defer();

      getUserInfoRef(uid).once("value", function(data) {
        if (data.val()) {
          _uid = uid;
          deferred.resolve();
        } else {
          deferred.reject();
        }
      });

      return deferred.promise;
    }
  }

})();
