(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($q, firebaseReferenceService, loginService) {

    firebaseReferenceService.ref.child('.info').on('value', function(snap){
      if (snap.val().connected === true){
        loginService.getUid()
          .then(_getUserData)
          .then(function(info){
            var presenceRef = firebaseReferenceService.getUserPresence().push(info);
            presenceRef.onDisconnect().remove();
          });
      }
    });

    function _getUserData(uid) {
      var defer = $q.defer();

      firebaseReferenceService.getUserEmailRef(uid).once('value')
        .then(function(emailSnap) {
          defer.resolve({
            uid: uid,
            email: emailSnap.val()
          });
        });

      return defer.promise;
    }

  }
})();
