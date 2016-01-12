'use strict';

var gulp = require('gulp');
var argv = require('yargs').argv;
var environments = require('../environments.json');
var run = require('gulp-run');

var environment = argv.env || 'dev';

gulp.task('deploy',function () {
  // console.log("IMPORTANT !! Remember to Build first with 'gulp'!!!");
  // TERRIBLE !!! but I could not make it to call the task sequentially.
  run('gulp && node_modules/firebase-tools/bin/firebase deploy --firebase ' + environments[environment].ENV.firebase).exec();  // prints "Hello World\n".
});
