'use strict';

/**
 * Dependencies
 */
const gulp = require('gulp');
const mocha = require('gulp-mocha');

// Watch
gulp.task('test', function(done) {

  gulp.src([
    './test/**/*.spec.js'
  ], {read: false})
    .pipe(mocha())
    .once('error', () => {
      process.exit(1);
    })
    .once('end', () => {
      done();
    });
});
