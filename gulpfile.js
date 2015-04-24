'use strict';
// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>

var gulp = require('gulp');
var open = require('open');
var del = require('del');
var wiredep = require('wiredep').stream;

// Load plugins
var $ = require('gulp-load-plugins')();

//copy leaflet images
gulp.task('leaflet', function() {
    return gulp.src('bower_components/leaflet/dist/images/*.*')
        .pipe(gulp.dest('dist/styles/images'));
});

//copy Views folder
gulp.task('views', function() {
    return gulp.src('src/Views/**/*')
        .pipe(gulp.dest('dist/Views'));
});

// Styles
gulp.task('styles', function () {
    return gulp.src(['src/styles/main.css'])
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});

// Icons
gulp.task('icons', function() {
    return gulp.src(['bower_components/bootstrap/dist/fonts/*.*','bower_components/font-awesome/fonts/*.*'])
        .pipe(gulp.dest('dist/fonts'));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['src/scripts/**/*.js'])
        //.pipe($.jshint('.jshintrc'))
        //.pipe($.jshint.reporter('default'))
        //.pipe($.size());
});

// HTML
gulp.task('html', ['styles', 'scripts', 'icons', 'leaflet', 'views'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('src/*.html')
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'src/images/**/*',
    		'src/lib/images/*'])
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function (cb) {
  del([
    'dist/styles/**',
    'dist/scripts/**',
	'dist/images/**',
  ], cb);
});

// dist
gulp.task('dist', ['html', 'images']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('dist');
});

// Connect
gulp.task('connect', function(){
    $.connect.server({
        root: 'dist',
        port: 9000,
    });
});

// Open
gulp.task('serve', ['connect'], function() {
  open("http://localhost:9000");
});

// Inject Bower components
gulp.task('wiredep', function () {
    gulp.src('src/styles/*.css')
        .pipe(wiredep({
            directory: 'src/bower_components',
            ignorePath: 'src/bower_components/'
        }))
        .pipe(gulp.dest('src/styles'));

    gulp.src('src/*.html')
        .pipe(wiredep({
            directory: 'src/bower_components',
            ignorePath: 'src/'
        }))
        .pipe(gulp.dest('src'));
});

// Watch
gulp.task('watch', ['connect', 'serve'], function () {
    // start up

});