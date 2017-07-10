const gulp = require('gulp')
  child = require('child_process')
  gutil = require('gulp-util')
  nunjucks = require('gulp-nunjucks-html')
  browserSync = require('browser-sync').create();

const config = {
  siteRoot: './docs',
  nunjucksTemplates: './nunjucks/templates',
  nunjucksPages: './nunjucks/pages',
  siteSrc: './src/**/*'
}

gulp.task('nunjucks', () => {
  return gulp.src(config.nunjucksPages + '/**/*.html')
    .pipe(nunjucks({
      searchPaths: [config.nunjucksTemplates]
    }))
    .pipe(gulp.dest(config.siteRoot))
});

gulp.task('webpack', () => {
  const webpack = child.spawn('webpack');

  const webpackLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Webpack: ' + message));
  };

  webpack.stdout.on('data', webpackLogger);
  webpack.stderr.on('data', webpackLogger);
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
});

gulp.task('default', ['nunjucks', 'webpack', 'serve']);