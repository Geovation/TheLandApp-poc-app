(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laProjectPanel', projectPanel);

  /** @ngInject */
  function projectPanel($mdBottomSheet, $mdDialog, projectService) {
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
      var originatorEv;

      vm.projectList = {};

      projectService.getProjectList().then(function(projectList) {
        vm.projectList = projectList;
        vm.projectList.myFarm.isActive = true;
      });

      vm.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
      };

      vm.toggleProject = function(project) {
        project.isActive = !project.isActive;
      };

      vm.displayNewProjectModal = function() {
        $mdDialog.show({
          templateUrl: 'app/main/project-panel/new-project-dialog.html',
          controller: ProjectDialogController,
          controllerAs: 'vmProjectDialog',
          clickOutsideToClose: true
        });

        function ProjectDialogController() {
          var vm = this;

          vm.project = {};

          vm.closeDialog = function() {
            $mdDialog.cancel();
          };

          vm.createProject = function() {
            projectService
              .createProject(vm.project.name)
              .then(function() {
                $mdDialog.hide();
                vm.showConfirmationDialog();
              });
          };

          vm.showConfirmationDialog = function() {
            var dialog = $mdDialog.alert()
              .title('Project created')
              .textContent('Your new project has been created. All new features will automatically be added to it.')
              .ok('Ok, thanks!');

            $mdDialog.show(dialog);
          };
        }
      };
    }
  }

})();
