(function() {
  'use strict';

  angular
    .module('LandApp')
    .factory('projectTagService', projectTagService);

  /** @ngInject */
  function projectTagService() {
    var service = {
      findMatchingTags: findMatchingTags
    };

    var defaultTags = createDefaultProjectTags();

    return service;

    //////////

    function findMatchingTags(searchQuery) {
      var regex = new RegExp(searchQuery, "i");

      return defaultTags.filter(function(tag) {
        return regex.test(tag.displayText);
      });
    }

    function createDefaultProjectTags() {
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
