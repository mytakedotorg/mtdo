const gulp = require('gulp')
  webpackCore = require('webpack')
  webpack = require('webpack-stream')
  path = require('path')
  fs = require('fs')
  gutil = require('gulp-util')
  nunjucks = require('gulp-nunjucks-html')
  concat = require('gulp-concat')
  autoprefixer = require('gulp-autoprefixer')
  sass = require('gulp-sass')
  notify = require('gulp-notify')
  browserSync = require('browser-sync').create();

const config = {
  siteRoot: './dist',
  publicDir: './dist/public',
  nunjucksTemplates: './nunjucks/templates',
  nunjucksPages: './nunjucks/pages',
  siteSrc: ['./src/**/*', '!src/**/*.spec.js'],
  sassFilter:  './assets/stylesheets/**/*.?(s)css'
}

gulp.task('css', () => {
	gulp.src(config.sassFilter)
		.pipe(sass({
			style: 'compressed'
			}).on("error", notify.onError(function (error) {
				return "Error: " + error.message;
			})))
		.pipe(autoprefixer({cascade: false, browsers: ['> 0.25%']}))
		.pipe(concat('all.css'))
		.pipe(gulp.dest(config.publicDir))
});

gulp.task('webpack', (cb) => {
  gulp.src(config.siteSrc)
    .pipe(webpack({
      config : require('./webpack.config.js')
    }, webpackCore, (err, stats) => {
      // workaround for https://github.com/shama/webpack-stream/issues/161
      const abspath = path.resolve(config.siteRoot + '/manifest.json')
      const content = stats.compilation.compiler.outputFileSystem.readFileSync(abspath)
      fs.writeFileSync(abspath, content)
      // makes this task blocking
      cb(err)
    }))
    .pipe(gulp.dest(config.siteRoot))
});

gulp.task('nunjucks', ['webpack'], () => {
  gulp.src(config.nunjucksPages + '/**/*.html')
    .pipe(nunjucks({
      searchPaths: [config.nunjucksTemplates],
      locals: { manifest: require(config.siteRoot + '/manifest.json') }
    }))
    .pipe(gulp.dest(config.siteRoot))
});

gulp.task('serve', () => {
  browserSync.init({
    files: [config.siteRoot + '/**'],
    port: 4000,
    server: {
      baseDir: config.siteRoot
    }
  });
  
  gulp.watch([config.nunjucksTemplates + '/**/*.html', 
              config.nunjucksPages + '/**/*.html'], ['nunjucks'])
  gulp.watch(config.siteSrc, ['webpack']);
  gulp.watch(config.sassFilter, ['css']);
});

gulp.task('default', ['css', 'webpack', 'nunjucks', 'serve']);
gulp.task('build', ['css', 'webpack', 'nunjucks']);
