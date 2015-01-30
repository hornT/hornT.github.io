var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('compress', function() {
  gulp.src('script.js')
    .pipe(uglify())
    .pipe(gulp.dest('script.min.js'))
});

gulp.task('default', function() {
  gulp.src('script.js')
    .pipe(uglify())
	//.pipe(addFileSuffix('.min'))
    .pipe(gulp.dest('min'))
});