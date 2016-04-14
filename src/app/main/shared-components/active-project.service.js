/**
 * Stores information about the currently active project/layer group.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('activeProjectService', activeProjectService);

  /** @ngInject */
  function activeProjectService() {
    var service = {
      setActiveProjectKey: setActiveProjectKey,
      getActiveProjectKey: getActiveProjectKey
    };

    var _activeProjectKey;

    return service;

    /**
     * Sets the active project key
     * @param {String} key Project key
     */
    function setActiveProjectKey(key) {
      _activeProjectKey = key;
    }

    /**
     * Returns the active project key
     * @return {String} Project key
     */
    function getActiveProjectKey() {
      return _activeProjectKey;
    }
  }
})();
