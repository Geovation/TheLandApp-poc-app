(function() {
  'use strict';

  angular
    .module('LandApp')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController(loginService) {
    var vm = this;

    vm.login = login;
    vm.signup = signup;

    /////////

    function login(){
      loginService.login(vm.email, vm.password);
    }

    function signup (){
      loginService.signup(vm.email, vm.password);
    }
    
  }
})();
