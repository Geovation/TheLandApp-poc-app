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
      createProject: createProject,
      toggleProject: toggleProject,
      getActiveProject: getActiveProject,
      getBaseFarmProject: getBaseFarmProject
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
          if (projectList.val()) {
            _projectList = projectList.val();

            if (!isInitialized && getBaseFarmProject()) {
              getBaseFarmProject().isActive = true;
            }

            isInitialized = true;
          }
        });
    }

    /**
     * Returns the currently active project.
     * @return {Object} Project object
     */
    function getActiveProject() {
      return _getProjectByAttribute("isActive", true);
    }

    /**
     * Returns the base farm project.
     * @return {Object} Project object
     */
    function getBaseFarmProject() {
      return _getProjectByAttribute("isBaseFarmProject", true);
    }

    /**
     * Toggles the passed project and deactivates all others.
     *
     * @param  {Object} toggledProject Project to toggle
     */
    function toggleProject(toggledProject) {
      angular.forEach(_projectList, function(project) {
        if (project !== toggledProject) {
          project.isActive = false;
        }
      });

      toggledProject.isActive = !toggledProject.isActive;
    }

    /**
     * Creates a new named project.
     *
     * @param  {String}   projectName       Name of the new project
     * @param  {Bool}     isBaseFarmProject Whether this is a base farm project
     * @return {Promise}                    Promise object
     */
    function createProject(projectName, isBaseFarmProject) {
      var deferred = $q.defer();

      if (isBaseFarmProject && getBaseFarmProject()) {
        deferred.reject("A base farm layer already exists");
      } else {
        var payload = {
          projectName: projectName,
          isBaseFarmProject: !!isBaseFarmProject
        };

        var projectRef = firebaseReferenceService.getUserProjectsRef().push(payload);

        projectRef
          .then(function() {
            deferred.resolve(projectRef.key());
          })
          .catch(function(error){
            deferred.reject(error);
            messageService.error(error);
          });
      }

      return deferred.promise;
    }

    /////////////////////////// PRIVATE ///////////////////////////

    /**
     * Finds a project based on a specific attribute value.
     *
     * @param  {String} attributeName  Attribute name (key)
     * @param  {mixed}  attributeValue Attribute value
     * @return {Object}                Found project or undefined
     */
    function _getProjectByAttribute(attributeName, attributeValue) {
      var foundProject;

      angular.forEach(_projectList, function(project) {
        if (project[attributeName] === attributeValue && !foundProject) {
          foundProject = project;
        }
      });

      return foundProject;
    }
  }

})();
