/* File: gulpfile.js */

// grab our packages
var gulp   = require('gulp'),
	gutil = require('gulp-util'),
	concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css'),
	sourcemaps = require('gulp-sourcemaps');;

// define the default task and add the watch task to it
gulp.task('default', ['build-js', 'minify-css']);
//gulp.task('default', ['watch']);

gulp.task('watch', function() {
  //gulp.watch('source/js/**/*.js', ['jshint']);
  gulp.watch('source/js/**/*.js', ['build-js']);
  gulp.watch('source/css/**/*.css', ['minify-css']);
});

// configure the jshint task
gulp.task('jshint', function() {
  return gulp.src('source/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build-js', ['jshint'], function() {
  return gulp.src('source/js/**/*.js')
    //.pipe(sourcemaps.init())
    .pipe(concat('script.js'))
      //only uglify if gulp is ran with '--type production'
      //.pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
	.pipe(uglify()) 
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('js'));
});

gulp.task('minify-css', function() {
  gulp.src('source/css/**/*.css')
	//.pipe(sourcemaps.init())
	.pipe(concat('style.css'))
    .pipe(minifyCSS())
	//.pipe(sourcemaps.write())
    .pipe(gulp.dest('css'))
});