# The Land App PoC

## Style Guide
John Papa code style: https://github.com/johnpapa/angular-styleguide
from https://github.com/Swiip/generator-gulp-angular/blob/master/docs/usage.md

## Install
  `npm install`
  `bower install`

## Gulp Tasks

* `gulp` or `gulp build` to build an optimized version of your application in `/dist`
* `gulp serve` to launch a browser sync server on your source files
* `gulp serve:dist` to launch a server on your optimized application
* `gulp test` to launch your unit tests with Karma
* `gulp test:auto` to launch your unit tests with Karma in watch mode
* `gulp protractor` to launch your e2e tests with Protractor
* `gulp protractor:dist` to launch your e2e tests with Protractor on the dist files

The default environment used is dev. To change environment just add --env=env_name. Example
`gulp serve --env=qa`

## Deploy
* `gulp deploy` build and deploy
