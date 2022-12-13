'use strict';

//load dependencies
var gulp = require('gulp'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    jshint = require('gulp-jshint'),
    size = require('gulp-size'),
    uglify = require('gulp-uglify-es').default,
    useref = require('gulp-useref'),
    cleanCSS = require('gulp-clean-css'),
    connect = require('gulp-connect'),
    autoprefixer = require('gulp-autoprefixer'),
    filter = require('gulp-filter'),
    del = require('del'),
    open = require('open'),
    semver = require('semver'),
    replace = require('gulp-string-replace'),
    stylish = require('jshint-stylish');

//get current app version
var version = require('./package.json').version;

//function for version lookup and tagging
function inc(importance) {
    //get new version number
    var newVer = semver.inc(version, importance);

    //bump appConfig version
    gulp.src('./src/appConfig.js')
        .pipe(replace(/configuration.version = "([^"]+)"/g, 'configuration.version = "' + newVer + '"'))
        .pipe(gulp.dest('./src/'));
        //.pipe(git.add());

    gulp.src('./dist/appConfig.js')
        .pipe(replace(/configuration.version = "([^"]+)"/g, 'configuration.version = "' + newVer + '"'))
        .pipe(gulp.dest('./dist/'));
        //.pipe(git.add());

    // get all the files to bump version in 
    gulp.src(['package.json'])
        // bump the version number in those files 
        .pipe(bump({ type: importance }))
        // save it back to filesystem 
        .pipe(gulp.dest(function(file) {
            return file.base;
        }))
        // commit the changed version number 
        .pipe(git.commit('Release v' + newVer))
        // **tag it in the repository** 
        //.pipe(git.tag('v' + newVer));
        .pipe(git.tag('v' + newVer, 'Version message', function (err) {
            if (err) throw err;
        }));
}

//tasks for version tags
gulp.task('patch', ['dist'], function () { return inc('patch'); });
gulp.task('feature', ['dist'], function () { return inc('minor'); });
gulp.task('release', ['dist'], function () { return inc('major'); });

//push task for versioning
gulp.task('push', function () {
    console.info('Pushing...');
    return git.push('USGS-WiM', 'master', { args: " --tags" }, function (err) {
        if (err) {
            console.error(err);
            throw err;
        } else {
            console.info('done pushing to github!');
        }
    });
});

//copy data
gulp.task('data', function () {
    return gulp.src('src/data/**/*')
        .pipe(gulp.dest('dist/data'));
});

//copy to views folder
gulp.task('views', function () {
    return gulp.src('src/Views/**/*')
        .pipe(gulp.dest('dist/Views'));
});

// Styles
gulp.task('styles', function () {
    return gulp.src(['src/styles/main.css'])
        .pipe(autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(size());
});

// Icons
gulp.task('icons', function () {
    return gulp.src(['node_modules/font-awesome/fonts/*.*'])
        .pipe(gulp.dest('dist/fonts'));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['src/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(size());
});

// HTML
gulp.task('html', ['styles', 'scripts', 'icons', 'views', 'data'], function () {
    var jsFilter = filter('**/*.js', { restore: true });
    var cssFilter = filter('**/*.css', { restore: true });

    function createErrorHandler(name) {
        return function (err) {
          console.error('Error from ' + name + ' in compress task', err.toString());
        };
      }

    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(jsFilter)
        .pipe(uglify())
        .on('error', createErrorHandler('uglify'))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(cleanCSS({ processImport: false }))
        .pipe(cssFilter.restore)
        .pipe(gulp.dest('dist'))
        .pipe(size());
});

// Images
gulp.task('images', function () {
    return gulp.src('src/images/**/*')
        .pipe(gulp.dest('dist/images'))
        .pipe(size());
});

// Leaflet
gulp.task('leaflet', function () {
    return gulp.src('node_modules/leaflet/dist/images/**/*')
        .pipe(gulp.dest('dist/styles/images'))
        .pipe(size());
});

// usgs-search-api
gulp.task('usgs-search-api', function () {
    return gulp.src('node_modules/usgs-search-api/dist/*.gif')
        .pipe(gulp.dest('dist/styles/images'))
        .pipe(size());
});

// appConfig
gulp.task('appConfig', function () {
    return gulp.src(['src/appConfig.js', 'web.config'])
        .pipe(gulp.dest('dist/'))
});

// Clean
gulp.task('clean', function (cb) {
    del([
      'dist/Views/**',
      'dist/fonts/**',
      'dist/styles/**',
      'dist/scripts/**',
      'dist/images/**'
    ], cb);
});

// build dist
gulp.task('dist', ['html', 'images', 'leaflet','usgs-search-api','appConfig']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('dist');
});

// Watch
gulp.task('watch', ['default', 'connect', 'serve'], function () {
    // start up
});

// Connect
gulp.task('connect', function () {
    connect.server({
        root: 'dist',
        port: 9000
    });
});

// Open
gulp.task('serve', ['connect'], function () {
    open("http://localhost:9000", { url: true });
});