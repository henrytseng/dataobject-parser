'use strict';

/**
 * Dependencies
 */
var path = require('path');
var gulp = require('gulp');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');

// Watch
gulp.task('watch', function() {

  watch([
    'lib/**/*.js',
    'test/**/*.spec.js'
  ], function() {
    runSequence('test');
  });

});
