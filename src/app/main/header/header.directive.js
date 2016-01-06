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
    function HeaderController($rootScope, $log, $q, $http) {
      var vm = this;
      vm.selectedItem = {};
      vm.searchText = "";
      vm.toggleLayersPanel = toggleLayersPanel;
      vm.searchTextChange = searchTextChange;
      vm.selectedItemChange = selectedItemChange;
      vm.querySearch = querySearch;
      /////////
      function toggleLayersPanel () {
        $log.debug('toggleLayersPanel');
        $rootScope.$emit('open-layers-panel');
      };

      function searchTextChange(text) {
        $log.debug("search text changed" + text);
      }

      function selectedItemChange(item) {
        $log.debug("address-selected " + JSON.stringify(item));
        $rootScope.$emit('address-selected', [item]);
      }

      // returns a primise as it is async.
      function querySearch(query) {
        var url = "http://nominatim.openstreetmap.org/search";
        var defer = $q.defer();

        $http.get(url, {params:{format:"json", q:query}})
          .then(
            function successCallback(response){
              defer.resolve(response.data);
            },
            function errorCallback(response){
              defer.reject(response);
            }
          );

        $log.debug(query);

        return defer.promise;
      }


    }
  }

})();
