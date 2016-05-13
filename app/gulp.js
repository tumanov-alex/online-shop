var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

gulp.task('uglify', function () {
    gulp.src('./public/*/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/minified'));

    gulp.src('./public/css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./public/minified/css'));
});