(function() {
  'use strict';

  angular
    .module('LandApp')
    .config(config);

  /** @ngInject */
  function config($logProvider, $mdThemingProvider) {
    // Enable log
    $logProvider.debugEnabled(true);

    // // Set options third-party lib
    // toastr.options.timeOut = 3000;
    // toastr.options.positionClass = 'toast-top-right';
    // toastr.options.preventDuplicates = true;
    // toastr.options.progressBar = true;

    var primary = '#28904E'; // not the real primary!!

    $mdThemingProvider.definePalette('landAppGreen', {
      '50': primary,
      '100': primary,
      '200': primary,
      '300': "#5BC381",
      '400': primary,
      '500': primary,
      '600': primary,
      '700': primary,
      '800': primary,
      '900': primary,
      'A100': primary,
      'A200': primary,
      'A400': primary,
      'A700': primary,
      'contrastDefaultColor': 'light',
      // on this palette should be dark or light
      'contrastDarkColors': ['50', '100',
        '200', '300', '400', 'A100'
      ],
      'contrastLightColors': undefined // could also specify this if default was 'dark'
    });

    $mdThemingProvider.definePalette('landAppOrange', {
      '50': 'feaa0c',
      '100': 'feaa0c',
      '200': 'feaa0c',
      '300': 'feaa0c',
      '400': 'feaa0c',
      '500': 'feaa0c',
      '600': 'feaa0c',
      '700': 'feaa0c',
      '800': 'feaa0c',
      '900': 'feaa0c',
      'A100': 'feaa0c',
      'A200': 'feaa0c',
      'A400': 'feaa0c',
      'A700': 'feaa0c',
      'contrastDefaultColor': 'light',
      // on this palette should be dark or light
      'contrastDarkColors': ['50', '100',
        '200', '300', '400', 'A100'
      ],
      'contrastLightColors': undefined // could also specify this if default was 'dark'
    });

    $mdThemingProvider.definePalette('landAppBlue', {
      '50': '01bdfb',
      '100': '01bdfb',
      '200': '01bdfb',
      '300': '01bdfb',
      '400': '01bdfb',
      '500': '01bdfb',
      '600': '01bdfb',
      '700': '01bdfb',
      '800': '01bdfb',
      '900': '01bdfb',
      'A100': '01bdfb',
      'A200': '01bdfb',
      'A400': '01bdfb',
      'A700': '01bdfb',
      'contrastDefaultColor': 'light',
      // on this palette should be dark or light
      'contrastDarkColors': ['50', '100',
        '200', '300', '400', 'A100'
      ],
      'contrastLightColors': undefined // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('landAppGreen')
      .accentPalette('landAppBlue');
  }

})();
