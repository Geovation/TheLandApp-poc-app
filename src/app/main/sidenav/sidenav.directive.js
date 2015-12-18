(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laSidenav', sidenav);

  /** @ngInject */
  function sidenav() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/sidenav/sidenav.html',
      controller: SidenavController,
      controllerAs: 'vmSidenav'
    };

    return directive;

    /** @ngInject */
    function SidenavController($rootScope, $mdSidenav, mapService) {
      var vm = this;

      $rootScope.$on('open-layers-panel', function() {
          $mdSidenav('layers-sidenav').toggle();
      });



    }
  }

})();
