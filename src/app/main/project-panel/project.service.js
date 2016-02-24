(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('projectService', projectService);

  /** @ngInject */
  function projectService($q, $timeout, firebaseReferenceService) {
    var service = {
      getProjectList: getProjectList,
      createProject: createProject
    };

    return service;

    /////////////////////////// PUBLIC ///////////////////////////

    function getProjectList() {
      var deferred = $q.defer();

      firebaseReferenceService.getUserProjectsRef()
        .once("value")
        .then(function(projectList) {
          deferred.resolve(projectList.val());
        })
        .catch(function(error) {
          deferred.reject(error);
        });

      return deferred.promise;
    }

    function createProject(projectName) {
      var deferred = $q.defer();

      $timeout(function() {
        deferred.resolve();
      }, 1000);

      return deferred.promise;
    }
  }

})();
