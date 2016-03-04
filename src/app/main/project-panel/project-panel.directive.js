/**
 * Handles the interactions and displaying of the projects panel.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laProjectPanel', projectPanel);

  /** @ngInject */
  function projectPanel($mdBottomSheet, $mdDialog, $rootScope, projectService) {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/project-panel/project-panel.html',
      controller: ProjectPanelController,
      controllerAs: 'vmProjectPanel'
    };

    return directive;

    /** @ngInject */
    function ProjectPanelController() {
      var vm = this;

      vm.getProjectList = projectService.getProjectList;
      vm.deactiveAllProjects = deactiveAllProjects;
      vm.openMenu = openMenu;
      vm.displayNewProjectModal = displayNewProjectModal;

      projectService.init();

      /**
       * Deactivates all projects.
       */
      function deactiveAllProjects() {
        angular.forEach(vm.getProjectList(), function(project) {
          project.isActive = false;
        });
      }

      /**
       * Opens the projects menu panel.
       *
       * @param  {Function}   $mdOpenMenu Angular mdMenu directive
       * @param  {MouseEvent} ev          Browser event object
       */
      function openMenu($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      }

      /**
       * Displays the dialog used to create a new project.
       */
      function displayNewProjectModal() {
        $mdDialog.show({
          templateUrl: 'app/main/project-panel/new-project-dialog.html',
          controller: ProjectDialogController,
          controllerAs: 'vmProjectDialog',
          clickOutsideToClose: true
        });

        /**
         * Controller for the modal dialog.
         */
        function ProjectDialogController() {
          var dialogVm = this;

          dialogVm.closeDialog = closeDialog;
          dialogVm.createProject = createProject;
          dialogVm.showConfirmationDialog = showConfirmationDialog;
          dialogVm.project = {};

          /**
           * Closes the active dialog by cancelling it.
           */
          function closeDialog() {
            $mdDialog.cancel();
          }

          /**
           * Creates a new project in the database and toggles it.
           */
          function createProject() {
            projectService
              .createProject(dialogVm.project.name)
              .then(function(projectKey) {
                $mdDialog.hide();
                dialogVm.showConfirmationDialog();
                vm.deactiveAllProjects();
                vm.getProjectList()[projectKey].isActive = true;
              });
          }

          /**
           * Displays a success dialog after a new project is created in the db.
           */
          function showConfirmationDialog() {
            var dialog = $mdDialog.alert()
              .title('Project created')
              .textContent('Your new project has been created. All new features will automatically be added to it.')
              .ok('Ok, thanks!');

            $mdDialog.show(dialog);
          }
        }
      }
    }
  }

})();
