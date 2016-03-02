(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController(loginService) {
    var vm = this;

    vm.login = function(){loginService.login(vm.email, vm.password);};
    vm.signup = function(){loginService.signup(vm.email, vm.password);};

    /////////
  }
})();
