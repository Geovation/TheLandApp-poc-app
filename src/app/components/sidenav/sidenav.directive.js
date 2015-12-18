(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laSidenav', sidenav);

  /** @ngInject */
  function sidenav() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/sidenav/sidenav.html',
      controller: SidenavController,
      controllerAs: 'vm'
    };

    return directive;

    /** @ngInject */
    function SidenavController($rootScope, $mdSidenav) {
    }
  }

})();
