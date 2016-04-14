(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($q, firebaseReferenceService, loginService) {

    firebaseReferenceService.ref.child('.info').on('value', function(snap){
      if (snap.val().connected === true){
        loginService.onceAuthData()
          .then(_getUserData)
          .then(function(info){
            var presenceRef = firebaseReferenceService.getUserPresenceRef().push(info);
            presenceRef.onDisconnect().remove();
          });
      }
    });

    function _getUserData(authData) {
      var defer = $q.defer();

      // logged in users
      if (authData && !authData.anonymous) {
        var uid = authData.auth.uid;

        firebaseReferenceService.getUserEmailRef(uid).once('value')
          .then(function(emailSnap) {
            defer.resolve({
              uid: uid,
              email: emailSnap.val()
            });
          });
      }
      // anonymous
      else if (authData) {
        defer.resolve({
          uid: authData.auth.uid,
          email: "Unknown"
        });
      }
      else {
        defer.reject(null);
      }

      return defer.promise;
    }

  }
})();
