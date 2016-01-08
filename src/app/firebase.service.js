(function() {
  'use strict';

  angular
    .module('LandApp')
    .service('firebaseService', firebaseService);

  /** @ngInject */
  function firebaseService($firebaseAuth, Firebase, ENV) {
    var firebaseRef = new Firebase("https://" + ENV.firebase + ".firebaseio.com");
    var service = {
      firebaseRef : firebaseRef,
      auth : $firebaseAuth(firebaseRef),
      getUserLayersRef : getUserLayersRef
    };

    return service;
    //////////

    function getUserLayersRef() {
      var uid = service.auth.$getAuth().uid;
      return service.firebaseRef
        .child("users")
        .child(uid)
        .child("layers");
    }
  }


})();
