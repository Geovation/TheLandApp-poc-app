(function() {
  'use strict';

  angular
    .module('LandApp')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'app/shared/login.html',
        controller: 'LoginController',
        controllerAs: 'loginVm'
      });
  }

})();
