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
  tasklisting = require('gulp-task-listing');
  del = require('del')
  flatmap = require('gulp-flatmap')

const config = {
  dist: './dist',
  unhashed: './dist-unhashed',
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

const DEV = 'Dev'
const PROD = 'Prod'

setupPipeline(DEV)
setupPipeline(PROD)

function setupPipeline(mode) {
  const sass = 'sass' + mode;
  const webpack = 'webpack' + mode;
  const nunjucks = 'nunjucks' + mode;
  gulp.task(sass, sassCfg(mode))
  gulp.task(webpack, webpackCfg(mode))

  if (mode === DEV) {
    gulp.task(nunjucks, [webpack], nunjucksCfg(mode))
  } else {
    const revtask = 'rev' + mode;
    gulp.task(revtask, [sass, webpack], () => {
      gulp.src([config.unhashed + '/*.css', config.unhashed + '/*.js'])
        .pipe(rev())
        .pipe(gulp.dest(config.dist))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.unhashed))
      gulp.src([config.unhashed + '/*.jpg', config.unhashed + '/*.js'])
        .pipe(gulp.dest(config.dist))
    })
    gulp.task(nunjucks, [revtask], nunjucksCfg(mode))
  }

  gulp.task(BUILD + mode, [nunjucks])
  gulp.task(SERVE + mode, [nunjucks], browserSyncCfg(mode))
}

gulp.task('default', tasklisting.withFilters(/clean|default|sass|webpack|nunjucks|rev|default/))
gulp.task('clean', () => {
  return del([config.dist, config.unhashed])
})

//////////////////////
// Config functions //
//////////////////////
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
      .pipe(gulp.dest(config.unhashed))
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
      .pipe(gulp.dest(config.unhashed))
  }
}

function nunjucksCfg(mode) {
  function forManifest(manifest) {
    return gulp.src(config.nunjucksPages + '/**/*.html')
      .pipe(nunjucks({
        searchPaths: [config.nunjucksTemplates],
        locals: {
          manifest: manifest
        }
      }))
  }
  return () => {
    if (mode == DEV) {
      var passthrough = {}
      for (key in ['all.css', 'app.bundle.js', 'blockEditor.bundle.js']) {
        passthrough[key] = key
      }
      return forManifest(passthrough).pipe(gulp.dest(config.unhashed))
    } else {
      gulp.src(config.unhashed + '/rev-manifest.json')
        .pipe(flatmap((stream, file) => {
          var contents = JSON.parse(file.contents.toString('utf8'));
          return forManifest(contents)
        })).pipe(gulp.dest(config.dist))
    }
  }
}

function browserSyncCfg(mode) {
  return () => {
    dir = mode === PROD ? config.dist : config.unhashed
    browserSync.init({
      files: [dir + '/**'],
      server: {
        baseDir: dir
      }
    });
    gulp.watch([config.nunjucksTemplates + '/**/*.html', 
                config.nunjucksPages + '/**/*.html'], ['nunjucks' + mode]);
    gulp.watch(config.webpackSrc, ['webpack' + mode]);
    gulp.watch(config.sassSrc, ['css' + mode]);
  }
}
