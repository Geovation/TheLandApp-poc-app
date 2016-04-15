/**
 * @ngdoc service
 * @name  LandApp.service:firebaseReferenceService
 * @description
 * Manages references to the Firebase database system.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('firebaseReferenceService', firebaseReferenceService);

  /** @ngInject */
  function firebaseReferenceService($q, Firebase, ENV) {
    var firebaseRef = new Firebase("https://" + ENV.firebase + ".firebaseio.com");
    var _uid = null;
    var service = {
      ref: firebaseRef,
      getUserInfoRef: getUserInfoRef,
      getUserLayersRef: getUserLayersRef,
      getUserMyFarmRef: getUserMyFarmRef,
      getUserFarmLayersRef: getUserFarmLayersRef,
      getUserUIDRef: getUserUIDRef,
      setUid: setUid,
      getUserProjectsRef: getUserProjectsRef,
      getUserPresenceRef: getUserPresenceRef,
      getUserEmailRef: getUserEmailRef
    };

    return service;

    ////////////// PUBLIC //////////////

    /**
     * @ngdoc method
     * @name  getUserPresenceRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the user's presence node.
     * @param  {String|undefined} uid User's UID
     * @return {Firebase}             Firebase reference object
     */
    function getUserPresenceRef(uid) {
      return getUserInfoRef(uid)
        .child('presence');
    }

    /**
     * @ngdoc method
     * @name  getUserEmailRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the user's email node.
     * @param  {String|undefined} uid User's UID
     * @return {Firebase}             Firebase reference object
     */
    function getUserEmailRef(uid) {
      return getUserInfoRef(uid)
        .child('email');
    }

    /**
     * @ngdoc method
     * @name  getUserInfoRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the user's info node.
     * @param  {String|undefined} uid User's UID
     * @return {Firebase}             Firebase reference object
     */
    function getUserInfoRef(uid) {
      return getUserUIDRef(uid)
        .child("info");
    }

    /**
     * @ngdoc method
     * @name  getUserProjectsRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the user's projects node.
     * @param  {String|undefined} uid User's UID
     * @return {Firebase}             Firebase reference object
     */
    function getUserProjectsRef(uid) {
      return getUserUIDRef(uid)
        .child("projects");
    }

    /**
     * @ngdoc method
     * @name  getUserLayersRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the layers node of the provided project.
     * @param  {String}           projectKey  Name of the project
     * @param  {String|undefined} uid         User's UID
     * @return {Firebase}                     Firebase reference object
     */
    function getUserLayersRef(projectKey, uid) {
      return getUserProjectsRef(uid)
        .child(projectKey)
        .child("layers");
    }

    /**
     * @ngdoc method
     * @name  getUserMyFarmRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the user's myFarm project node.
     * @param  {String|undefined} uid User's UID
     * @return {Firebase}             Firebase reference object
     */
    function getUserMyFarmRef(uid) {
      return getUserProjectsRef(uid)
        .child("myFarm");
    }

    /**
     * @ngdoc method
     * @name  getUserFarmLayersRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the user's myFarm farm layers node.
     * @param  {String|undefined} uid User's UID
     * @return {Firebase}             Firebase reference object
     */
    function getUserFarmLayersRef(uid) {
      return getUserMyFarmRef(uid)
        .child("layers/farm");
    }

    /**
     * @ngdoc method
     * @name  getUserUIDRef
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Returns a reference to the user's user node. If the uid param
     * is falsey it will attempt to find the UID on its own.
     * @param  {String|undefined} uid User's UID
     * @return {Firebase}             Firebase reference object
     */
    function getUserUIDRef(uid) {
      uid = uid || _uid || (firebaseRef.getAuth() && firebaseRef.getAuth().uid);
      return firebaseRef
        .child("users")
        .child(uid);
    }

    /**
     * @ngdoc method
     * @name  setUid
     * @methodOf LandApp.service:firebaseReferenceService
     * @description
     * Sets the current user's UID after verifying that such a UID exists in the database.
     * @param  {String|undefined} uid User's UID
     * @return {Promise}              Promise object which will only be resolved if the user is found
     */
    function setUid(uid) {
      var deferred = $q.defer();

      getUserInfoRef(uid).once("value", function(data) {
        if (data.exists()) {
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
