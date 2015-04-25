'use strict';
// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>

var gulp = require('gulp'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tag_version = require('gulp-tag-version'),
    open = require('open'),
    del = require('del'),
    wiredep = require('wiredep').stream;

// Load plugins
var $ = require('gulp-load-plugins')();

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */

function inc(importance) {
    // get all the files to bump version in 
    return gulp.src(['./package.json', './bower.json'])
        // bump the version number in those files 
        .pipe(bump({ type: importance }))
        // save it back to filesystem 
        .pipe(gulp.dest('./'))
        // commit the changed version number 
        .pipe(git.commit('bumps package version'))

        // read only one file to get the version number 
        .pipe(filter('package.json'))
        // **tag it in the repository** 
        .pipe(tag_version());
}

gulp.task('patch', function () { return inc('patch'); })
gulp.task('feature', function () { return inc('minor'); })
gulp.task('release', function () { return inc('major'); })


gulp.task('bump', function () {
    return gulp.src(['./package.json', './bower.json'])
      .pipe(bump())
      .pipe(gulp.dest('./'));
});

gulp.task('tag', ['bump'], function () {
    var pkg = require('./package.json');
    var v = 'v' + pkg.version;
    var message = 'Release ' + v;

    return gulp.src('.')
        .pipe(git.commit(message))
        .pipe(git.tag(v, message));
        //.pipe(git.push('origin', 'master'));
        //.pipe(gulp.dest('./'));
});

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