'use strict';

var gulp = require('gulp');
var recursiveFolder = require('gulp-recursive-folder');
var gulpDocs = require('gulp-ngdocs');

var options = {
  scripts: [
    'bower_components/angular/angular.min.js',
    'bower_components/angular/angular.min.js.map',
    'bower_components/angular-animate/angular-animate.min.js',
    'bower_components/angular-animate/angular-animate.min.js.map'
  ]
};

gulp.task('ngdocs', recursiveFolder('src', function(foundFolder) {
  return gulp.src(foundFolder.path + "/*.js")
    .pipe(gulpDocs.process(options))
    .pipe(gulp.dest('./ng-docs'));
}));
