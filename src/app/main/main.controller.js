(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($mdDialog) {
    function showOnboardingDialog() {
      $mdDialog.show({
          templateUrl: 'app/main/tour/onboarding-dialog.html',
          parent: angular.element(document.body),
          clickOutsideToClose: true,
          controller: function($scope, $mdDialog) {
            $scope.continue = function() {
              $mdDialog.hide();
            }
          }
        });
    }

    showOnboardingDialog();

  }
})();
