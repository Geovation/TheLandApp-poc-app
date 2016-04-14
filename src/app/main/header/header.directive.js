(function() {
  'use strict';

  angular
    .module('LandApp')
    .directive('laHeader', header);

  /** @ngInject */
  function header() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/main/header/header.html',
      controller: HeaderController,
      controllerAs: 'vmHeader',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function HeaderController($rootScope, $log, $q, $http, $mdDialog, $timeout, firebaseReferenceService, projectService) {
      var vm = this;
      vm.selectedItem = null;
      vm.searchText = "";
      vm.toggleLayersPanel = toggleLayersPanel;
      vm.searchTextChange = searchTextChange;
      vm.selectedItemChange = selectedItemChange;
      vm.querySearch = querySearch;
      vm.shareDialog = shareDialog;
      vm.mapOwner = "";
      vm.usersAccedingCurrentMap = [];
      vm.isThereAnyProjectActive = projectService.isThereAnyProjectActive;

      var colorsAssigned = {};
      var colourIndex = 0;
      var COLORS = ['Aqua', 'Green', 'Yellow', 'Magenta', 'Red', 'White', 'Blue' ];

      _initPresenceAndEmail();
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      function _initPresenceAndEmail() {

        firebaseReferenceService.getUserEmailRef().once("value", function(email) {
          vm.mapOwner = email.val();
        });

        firebaseReferenceService.getUserPresenceRef().on("value", function(presence) {
          $timeout(function() {
            vm.usersAccedingCurrentMap = [];

            angular.forEach(presence.val(), function(value,key){
              if (!colorsAssigned[key]) {
                // give me the next color from COLORS
                colorsAssigned[key] = COLORS[colourIndex];
                colourIndex = (colourIndex + 1) % COLORS.length;
              }
              var userWatching = {
                color: colorsAssigned[key],
                email: value.email,
                initials: value.email.substr(0,2).toUpperCase()
              };
              vm.usersAccedingCurrentMap.push(userWatching);
            });
          });
        });

      } // _initPresenceAndEmail

      function toggleLayersPanel () {
        $log.debug('toggleLayersPanel');
        $rootScope.$broadcast('open-layers-panel');
      }

      function searchTextChange(text) {
        $log.debug("search text changed" + text);
      }

      function selectedItemChange(address) {
        $log.debug("address-selected " + JSON.stringify(address));
        $rootScope.$broadcast('address-selected', address);
      }

      // returns a promise as it is async.
      function querySearch(query) {
        $log.debug("Query search:" + query);

        var url = "https://nominatim.openstreetmap.org/search";
        var defer = $q.defer();

        $http.get(url, {params:{format:"json", q:query, countrycodes:"gb"}})
          .then(
            function successCallback(response){
              defer.resolve(response.data);
            },
            function errorCallback(response){
              defer.reject(response);
            }
          );

        return defer.promise;
      }

      function shareDialog() {
        var dialogConfig = {
          templateUrl: "app/main/header/share.html",
          clickOutsideToClose:true,
          controller: shareController,
          controllerAs: "vmShare"
        };
        $mdDialog.show(dialogConfig);
      }

      function shareController() {
        var vm = this;

        vm.sharedUsers = [];
        vm.sharedPublic = {};

        vm.addUserClick = addUserClick;

        _initFb();
        ///////////////////////

        function addUserClick() {
          var dialogConfig = $mdDialog
            .alert()
            .title('Saving to our DB is coming soon!')
            .ok('Ok, awesome');
          $mdDialog.show(dialogConfig);
        }

        /**
         * Sync with FB.
         *
         * @private
         */
        // TODO
        function _initFb() {
          $timeout(function() {
            vm.sharedPublic = {read:true, write:false};
            vm.sharedUsers =  [
              {
                email: "one@lad.com",
                name: "some name",
                read: true,
                write: true
              },
              {
                email: "two@lad.com",
                name: "some name",
                read: false,
                write: true
              },
              {
                email: "three@lad.com",
                name: "some name",
                read: true,
                write: false
              },
              {
                email: "four@lad.com",
                name: "some name",
                read: false,
                write: false
              }
            ];
          });
        }

      }

    }
  }

})();
