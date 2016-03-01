(function() {
  'use strict';

  angular
    .module('LandApp')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/', {
        resolve: {
          isLoggedIn: function(loginService) {
            return loginService.checkUser();
          }
        }
      })
      .when('/user/:uid', {
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main',
        resolve: {
          uid: function(loginService) {return loginService.getUid();}
        }
      })
      .when('/login', {
        templateUrl: 'app/login.html',
        controller: 'LoginController',
        controllerAs: 'loginVm'
      })
      .otherwise({
        redirectTo: '/'
      });
  }

})();
