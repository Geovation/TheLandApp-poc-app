'use strict';

var gulp = require('gulp');
var fs = require('fs');
var argv = require('yargs').argv;
var gulpNgConfig = require('gulp-ng-config');

var environment = argv.env || 'dev';

gulp.task('config', function () {
  gulp.src('environments.json')
    .pipe(gulpNgConfig('LandApp', {
      environment: environment,
      wrap: "(function() {\n'use strict';\n\n<%= module %>\n})();",
      createModule: false
    }))
    .pipe(gulp.dest('src/app'));
});
