// Gulp Dependencies
var gulp = require('gulp');
var express = require('express');

// Build Dependencies
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var mainBowerFiles = require('main-bower-files');
var runSequence = require('gulp-run-sequence')

// Style Dependencies
var stylus = require('gulp-stylus');
var cssmin = require('gulp-cssmin');
var nib = require('nib');

// html Dependecies
var minifyHTML = require('gulp-minify-html');

// Paths
var stylePath = 'app/styles/**/*.styl';
var htmlPath = 'app/*.html';
var scriptPath = 'app/script/**/*.js';
var fontsPath = 'app/fonts/*';
var imagesPath = 'app/images/*';
var devPath = 'dev/';
var distPath = 'dist/';
var bowerPath = 'bower_components/';

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

gulp.task('devServer', function() {
  var app = express();
  app.use(express.static(devPath));
  app.listen(3030);
});

gulp.task('prodServer', function() {
  var app = express();
  app.use(express.static(distPath));
  app.listen(process.env.PORT || 5000);
});

gulp.task('styles', function() {
  return gulp.src(stylePath)
    .pipe(concat('application.styl'))
    .pipe(stylus({ use: nib() }))
    .on('error', handleError)
    .pipe(concat('application.css'))
    .pipe(gulp.dest('dev/styles'))
    .pipe(concat('application.min.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('html', function() {
  return gulp.src(htmlPath)
    .pipe(inject(gulp.src(['./dev/styles/*.css', './dev/script/*.js'], { read: false }), {
      addRootSlash: false,
      ignorePath: 'dev/'
    }))
    .pipe(gulp.dest(devPath))
    .pipe(inject(gulp.src(['./dist/styles/*.css', './dist/script/*.js'], { read: false }), {
      addRootSlash: false,
      ignorePath: 'dist/'
    }))
    .pipe(minifyHTML())
    .pipe(gulp.dest(distPath))
});

gulp.task('script', function() {
  return gulp.src(scriptPath)
    .pipe(concat('application.js'))
    .pipe(gulp.dest('dev/script/'))
    .pipe(concat('application.min.js'))
    .pipe(uglify())
    .on('error', handleError)
    .pipe(gulp.dest('dist/script/'))
});

gulp.task('vendor', function() {
  return gulp.src(mainBowerFiles())
    .pipe(concat('_vendor.js'))
    .pipe(gulp.dest('dev/script/'))
    .pipe(concat('_vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/script/'))
});

gulp.task('fonts', function() {
  return gulp.src(fontsPath)
    .pipe(gulp.dest('dev/fonts/'))
    .pipe(gulp.dest('dist/fonts/'))
});

gulp.task('images', function() {
  return gulp.src(imagesPath)
    .pipe(gulp.dest('dev/images/'))
    .pipe(gulp.dest('dist/images/'))
});

gulp.task('watch', function() {
  gulp.watch(stylePath, ['styles']);
  gulp.watch(htmlPath, ['html']);
  gulp.watch(scriptPath, ['script']);
});

gulp.task('build', function(cb) {
  runSequence('fonts', 'images', 'styles', 'script', 'html', cb);
});

gulp.task('default', ['build', 'devServer', 'watch'], function() {});
gulp.task('production', ['build', 'prodServer'], function() {});
