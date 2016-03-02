/**
 * Handles the creation and management of projects.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('projectService', projectService);

  /** @ngInject */
  function projectService($q, $timeout, firebaseReferenceService, messageService) {
    var service = {
      init: init,
      getProjectList: function() { return _projectList; },
      createProject: createProject
    };

    var _projectList = {};

    return service;

    /////////////////////////// PUBLIC ///////////////////////////

    /**
     * Initializes the service by loading project details from the db.
     */
    function init() {
      var isInitialized = false;

      firebaseReferenceService
        .getUserProjectsRef()
        .on("value", function(projectList) {
          _projectList = projectList.val();

          if (!isInitialized) {
            _projectList.myFarm.isActive = true;
            isInitialized = true;
          }
        });
    }

    /**
     * Creates a new named project.
     *
     * @param  {String}   projectName Name of the new project
     * @return {Promise}              Promise object
     */
    function createProject(projectName) {
      var deferred = $q.defer();
      var projectRef = firebaseReferenceService.getUserProjectsRef().push({projectName: projectName});

      projectRef
        .then(function() {
          deferred.resolve(projectRef.key());
        })
        .catch(function(error){
          deferred.reject(error);
          messageService.error(error);
        });

      return deferred.promise;
    }
  }

})();
