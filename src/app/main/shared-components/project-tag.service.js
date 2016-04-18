/**
 * @ngdoc service
 * @name  LandApp.service:projectTagService
 * @description
 * Manages the querying of internall stored default project tags.
 */
(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('projectTagService', projectTagService);

  /** @ngInject */
  function projectTagService() {
    return {
      findMatchingTags: findMatchingTags
    };

    ///////////////// PUBLIC /////////////////

    /**
     * @ngdoc method
     * @name  findMatchingTags
     * @methodOf LandApp.service:projectTagService
     * @description
     * Returns a list of tag definitions which match the search query.
     *
     * @param  {String}   searchQuery User's search query
     * @return {Object[]}             List of tag definition objects
     */
    function findMatchingTags(searchQuery) {
      var regex = new RegExp(searchQuery, "i");

      return _generateDefaultProjectTags().filter(function(tag) {
        return regex.test(tag.displayText);
      });
    }

    ///////////////// PRIVATE /////////////////

    /**
     * @ngdoc method
     * @name  _generateDefaultProjectTags
     * @methodOf LandApp.service:projectTagService
     * @description
     * Generates a list of default tag definitions.
     * @return {Object[]} List of default tag definitions
     */
    function _generateDefaultProjectTags() {
      return [{
        name: "digitse-farm",
        displayText: "Digitise farm"
      }, {
        name: "diversification-1",
        displayText: "Diversification project 1"
      }, {
        name: "diversification-2",
        displayText: "Diversification project 2"
      }, {
        name: "diversification-3",
        displayText: "Diversification project 3"
      }, {
        name: "countryside-stewardship",
        displayText: "Countryside Stewardship Scheme"
      }];
    }
  }

})();
