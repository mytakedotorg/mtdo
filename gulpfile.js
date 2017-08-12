const gulp = require('gulp')
  // sass
  sass = require('gulp-sass')
  autoprefixer = require('gulp-autoprefixer')
  concat = require('gulp-concat')
  notify = require('gulp-notify')
  // webpack
  webpackCore = require('webpack')
  webpack = require('webpack-stream')
  path = require('path')
  fs = require('fs')
  // html
  nunjucks = require('gulp-nunjucks-html')
  // misc
  browserSync = require('browser-sync').create();
  rev = require('gulp-rev');

const config = {
  dist: './dist',
  sassSrc:  './assets/stylesheets/**/*.?(s)css',
  webpackSrc: ['./src/**/*', '!src/**/*.spec.js'],
  nunjucksTemplates: './nunjucks/templates',
  nunjucksPages: './nunjucks/pages',
}

///////////////////////////////
// Create dev and prod tasks //
///////////////////////////////
const BUILD = 'build'
const SERVE = 'serve'

function setup(mode) {
  const sass = 'sass' + mode;
  const webpack = 'webpack' + mode;
  const nunjucks = 'nunjucks' + mode;
  gulp.task(sass, sassCfg(mode))
  gulp.task(webpack, webpackCfg(mode))
  gulp.task(nunjucks, [webpack], nunjucksCfg(mode))

  gulp.task(BUILD + mode, [nunjucks])
  gulp.task(SERVE + mode, browserSyncCfg(mode))
}
const DEV = 'Dev'
const PROD = 'Prod'
setup(DEV)
setup(PROD)

gulp.task(SERVE, [SERVE + DEV])
gulp.task(BUILD, [BUILD + PROD])
gulp.task('default', [SERVE]);

//////////////////////
// Config functions //
//////////////////////
function browserSyncCfg(mode) {
  return () => {
    browserSync.init({
      files: [config.dist + '/**'],
      server: {
        baseDir: config.dist
      }
    });
    gulp.watch([config.nunjucksTemplates + '/**/*.html', 
                config.nunjucksPages + '/**/*.html'], ['nunjucks' + mode]);
    gulp.watch(config.webpackSrc, ['webpack' + mode]);
    gulp.watch(config.sassSrc, ['css' + mode]);
  }
}

function sassCfg(mode) {
  return () => {
    gulp.src(config.sassSrc)
      .pipe(sass({
        style: 'compressed'
        }).on("error", notify.onError(function (error) {
          return "Error: " + error.message;
        })))
      .pipe(autoprefixer({cascade: false, browsers: ['> 0.25%']}))
      .pipe(concat('all.css'))
      .pipe(gulp.dest(config.dist))
  }
}

function nunjucksCfg(mode) {
  return () => {
    gulp.src(config.nunjucksPages + '/**/*.html')
      .pipe(nunjucks({
        searchPaths: [config.nunjucksTemplates],
        locals: { manifest: require(config.dist + '/manifest.json') }
      }))
      .pipe(gulp.dest(config.dist))
  }
}

function webpackCfg(mode) {
  return (cb) => {
    gulp.src(config.webpackSrc)
      .pipe(webpack({
        config : require('./webpack.config.js')
      }, webpackCore, (err) => {
        // makes this task blocking
        cb(err)
      }))
      .pipe(gulp.dest(config.dist))
  }
}
