(function() {
  'use strict';

  angular
    .module('LandApp')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/', {
        resolve: {
          checkUser: function(loginService) {
            return loginService.checkUser();
          }
        }
      })
      .when('/main/:uid', {
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main',
        resolve: {
          uid: function(loginService) {return loginService.getUid();}
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }

})();
