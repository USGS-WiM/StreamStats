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
    return gulp.src('src/bower_components/leaflet/dist/images/*.*')
        .pipe(gulp.dest('src/images'));
});

// Styles
gulp.task('styles', function () {
    return gulp.src(['src/styles/main.css'])
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('src/styles'))
        .pipe($.size());
});

// Icons
gulp.task('icons', function() {
    return gulp.src('src/bower_components/bootstrap/dist/fonts/*.*')
        .pipe(gulp.dest('build/fonts'));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['src/scripts/**/*.js'])
        //.pipe($.jshint('.jshintrc'))
        //.pipe($.jshint.reporter('default'))
        //.pipe($.size());
});

// HTML
gulp.task('html', ['styles', 'scripts', 'icons'], function () {
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
		//.pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('build'))
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'src/images/**/*',
    		'src/lib/images/*'])
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function (cb) {
  del([
    'build/styles/**',
    'build/scripts/**',
	'build/images/**',
  ], cb);
});

// Build
gulp.task('build', ['html', 'images']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', function(){
    $.connect.server({
        root: 'src',
        port: 9000,
        livereload: true
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
    // Watch for changes in `app` folder
    gulp.watch([
        'src/*.html',
        'src/styles/**/*.css',
        'src/scripts/**/*.js',
        'src/images/**/*'
    ], function (event) {
        return gulp.src(event.path)
            .pipe($.connect.reload());
    });

    // Watch .css files
    gulp.watch('src/styles/**/*.css', ['styles']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('src/images/**/*', ['images']);

    // Watch bower files
    gulp.watch('bower.json', ['wiredep']);
});