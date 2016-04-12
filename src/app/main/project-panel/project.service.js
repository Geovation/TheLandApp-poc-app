/**
 * Handles the creation and management of projects.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('projectService', projectService);

  /** @ngInject */
  function projectService($q,
    firebaseReferenceService, messageService, olLayerGroupService, olUserLayerService, activeProjectService) {
    var service = {
      init: init,
      getProjectList: function() { return _projectList; },
      createProject: createProject,
      setProjectVisibility: setProjectVisibility,
      getActiveProject: getActiveProject,
      getMyFarmProject: getMyFarmProject,
      deleteProject: deleteProject,
      isThereAnyProjectActive: isThereAnyProjectActive
    };

    var _projectList = {};

    return service;

    /////////////////////////// PUBLIC ///////////////////////////

    /**
     * Initializes the service by loading project details from the db.
     */
    function init() {
      var defer = $q.defer();
      var isInitialized = false;

      firebaseReferenceService
        .getUserProjectsRef()
        .on("value", function(projectList) {
          var oldProjectList = angular.copy(_projectList);

          if (projectList.exists()) {
            _projectList = projectList.val();

            angular.forEach(_projectList, function(value, key) {
              value.key = key;
              value.isActive = !!(oldProjectList && oldProjectList[key] && oldProjectList[key].isActive);
              olLayerGroupService.setGroupVisibility(key, value.isActive);
            });

            if (!isInitialized) {
              setProjectVisibility(getMyFarmProject());

              isInitialized = true;
            }

            defer.resolve();
          }
        });

      // TODO: manage the case when the current project is deleted by another user.
      return defer.promise;
    }

    /**
     * Returns true if there is at least one active project, false otherwise.
     * @return {Boolean}
     */
    function isThereAnyProjectActive() {
      return angular.isDefined(getActiveProject()) || (getMyFarmProject() && getMyFarmProject().isActive);
    }

    /**
     * Toggles a project's visiblity.
     *
     * @param {Object} toggledProject Project to toggle
     */
    function setProjectVisibility(toggledProject) {
      olUserLayerService.clearSelectedFeatures();

      toggledProject.isActive = !toggledProject.isActive;

      if (toggledProject === getMyFarmProject()) {
        // when toggling the myFarm project on or off, hide all of its farm layers because they
        // are manually toggled in different parts of the app (via ol.layer.Vector.setVisible)
        // and calling ol.layer.Group.setVisible doesn't override their visibility
        olLayerGroupService.hideFarmDataLayers();
      } else {
        // hide every project except for myFarm and the one currently being toggled
        angular.forEach(_projectList, function (project) {
          if (project.key !== "myFarm" && project.key !== toggledProject.key) {
            project.isActive = false;
            olLayerGroupService.setGroupVisibility(project.key, project.isActive);
          }
        });
      }

      // active project is the current one, the farm or none
      var activeProjectKey = null;

      if (toggledProject !== getMyFarmProject() && toggledProject.isActive) {
        activeProjectKey = toggledProject.key;
      }
      else if (toggledProject === getMyFarmProject() && getActiveProject() && getActiveProject() !== getMyFarmProject()) {
        activeProjectKey = getActiveProject().key;
      }
      else if (getMyFarmProject().isActive) {
        activeProjectKey = getMyFarmProject().key;
      }

      activeProjectService.setActiveProjectKey(activeProjectKey);

      // show the ol group
      olLayerGroupService.setGroupVisibility(toggledProject.key, toggledProject.isActive);

      olUserLayerService.readDrawingFeatures();
    }

    /**
     * Returns the currently active project.
     * @return {Object} Project object
     */
    function getActiveProject() {
      return _projectList[activeProjectService.getActiveProjectKey()];
    }

    /**
     * Returns the base farm project.
     * @return {Object} Project object
     */
    function getMyFarmProject() {
      return _projectList.myFarm;
    }

    /**
     * Creates a new named project.
     *
     * @param  {String}   projectName       Name of the new project
     * @param  {Bool}     isMyFarm Whether this is a base farm project
     * @return {Promise}                    Promise object
     */
    function createProject(projectName, isMyFarm) {
      var deferred = $q.defer();

      if (isMyFarm && getMyFarmProject()) {
        deferred.reject("A base farm layer already exists");
      } else {
        var project = {
          projectName: projectName
        };

        var projectListRef = firebaseReferenceService.getUserProjectsRef();

        // the base farm project has a static key (myFarm)
        // every other project has a random key generated by Firebase
        var projectRef = isMyFarm ? firebaseReferenceService.getUserMyFarmRef() : projectListRef.push();
        _projectList[projectRef.key()] = {isActive:true};

        // create layers and group for new project
        projectRef.set(project)
          .then(function() {
            project.key = projectRef.key();
            projectRef.once("value")
              .then(function(projectSnapshot) {
                olUserLayerService.createLayers(projectSnapshot);
                setProjectVisibility(project);
                deferred.resolve(project);
              })
              .catch(function(error){
                deferred.reject(error);
                messageService.error(error);
              });
          })
          .catch(function(error) {
            deferred.reject(error);
            messageService.error(error);
          });
      }

      return deferred.promise;
    }

    /**
     * Deletes a given project from the db and removes it from the map.
     *
     * @param  {Object}  project Project object
     * @return {Promise}         Promise
     */
    function deleteProject(project) {
      var deferred = $q.defer();
      var projectListRef = firebaseReferenceService.getUserProjectsRef();

      if (!_projectList[project.key]) {
        deferred.reject("Attempting to delete undefined project");
      } else {
        olLayerGroupService.removeLayerGroup(project.key);

        delete _projectList[project.key];

        projectListRef
          .set(_projectList)
          .then(deferred.resolve)
          .catch(function(error) {
            deferred.reject(error);
            messageService.error(error);
          });
      }

      return deferred.promise;
    }
  }

})();
