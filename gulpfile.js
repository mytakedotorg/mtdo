const gulp = require('gulp')
  child = require('child_process')
  gutil = require('gulp-util')
  nunjucks = require('gulp-nunjucks-html')
  concat = require('gulp-concat')
  autoprefixer = require('gulp-autoprefixer')
  sass = require('gulp-sass')
  notify = require('gulp-notify')
  browserSync = require('browser-sync').create();

const config = {
  siteRoot: './docs',
  publicDir: './docs/public',
  nunjucksTemplates: './nunjucks/templates',
  nunjucksPages: './nunjucks/pages',
  siteSrc: './src/**/*',
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

gulp.task('nunjucks', () => {
  return gulp.src(config.nunjucksPages + '/**/*.html')
    .pipe(nunjucks({
      searchPaths: [config.nunjucksTemplates],
      locals: { manifest: require('./docs/manifest.json') }
    }))
    .pipe(gulp.dest(config.siteRoot))
});

gulp.task('webpack', (cb) => {
  const webpack = child.spawn('webpack');
  // log
  const webpackLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Webpack: ' + message));
  };
  webpack.stdout.on('data', webpackLogger);
  webpack.stderr.on('data', webpackLogger);
  // block until webpack exits
  webpack.on('close', (code) => {
    cb(code);
  })
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
