'use strict';

var gulp = require('gulp');
var argv = require('yargs').argv;
var environments = require('../environments.json');
var run = require('gulp-run');

var environment = argv.env || 'dev';

gulp.task('deploy', ['default'], function () {
  run('firebase deploy --firebase ' + environments[environment].ENV.firebase).exec();  // prints "Hello World\n".
});
