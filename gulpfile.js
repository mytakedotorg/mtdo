const gulp = require("gulp");
// sass
sass = require("gulp-sass");
autoprefixer = require("gulp-autoprefixer");
concat = require("gulp-concat");
notify = require("gulp-notify");
// webpack
webpackCore = require("webpack");
webpack = require("webpack-stream");
path = require("path");
fs = require("fs");
// html
nunjucks = require("gulp-nunjucks-html");
// file loaders
ts = require("gulp-typescript");
tsProject = ts.createProject("./loaders/tsconfig.json");
// misc
browserSync = require("browser-sync").create();
tasklisting = require("gulp-task-listing");
del = require("del");
gutil = require("gulp-util");

const config = {
  dist: "./dist",
  cssSrc: "./assets/public/**/*.css",
  sassSrc: "./assets/stylesheets/**/*.?(s)css",
  imgSrc: "./assets/images/**/*.{jpg,png}",
  webpackSrc: ["./src/**/*", "!src/**/*.spec.js"],
  nunjucksTemplates: "./nunjucks/templates",
  nunjucksPages: "./nunjucks/pages",
  loadersSrc: "./loaders/src/**/*.ts",
  loadersDist: "./loaders/dist"
};

///////////////////////////////
// Create dev and prod tasks //
///////////////////////////////
const BUILD = "build";
const SERVE = "serve";

const DEV = "Dev";
const PROD = "Prod";

setupPipeline(DEV);
setupPipeline(PROD);

function setupPipeline(mode) {
  const css = "css" + mode;
  const sass = "sass" + mode;
  const webpack = "webpack" + mode;
  const nunjucks = "nunjucks" + mode;
  const images = "images" + mode;
  const loaders = "loaders" + mode;
  gulp.task(css, cssCfg(mode));
  gulp.task(sass, sassCfg(mode));
  gulp.task(webpack, [loaders], webpackCfg(mode));
  gulp.task(nunjucks, [webpack], nunjucksCfg(mode));
  gulp.task(images, imagesCfg(mode));
  gulp.task(loaders, loadersCfg(mode));
  gulp.task(BUILD + mode, [nunjucks, sass, images, css]);
  gulp.task(SERVE + mode, [BUILD + mode], browserSyncCfg(mode));
}

gulp.task(
  "default",
  tasklisting.withFilters(
    /clean|default|css|sass|webpack|nunjucks|images|loaders|rev|default/
  )
);
gulp.task("clean", () => {
  return del([config.dist]);
});

//////////////////////
// Config functions //
//////////////////////
function cssCfg(mode) {
  return () => {
    return gulp.src(config.cssSrc).pipe(gulp.dest(config.dist + "/"));
  };
}

function sassCfg(mode) {
  return () => {
    gulp
      .src(config.sassSrc)
      .pipe(
        sass({
          style: "compressed"
        }).on(
          "error",
          notify.onError(function(error) {
            return "Error: " + error.message;
          })
        )
      )
      .pipe(autoprefixer({ cascade: false, browsers: ["> 0.25%"] }))
      .pipe(concat("all.css"))
      .pipe(gulp.dest(config.dist));
  };
}

function webpackCfg(mode) {
  const configFile =
    mode === DEV ? "./webpack.config.dev.js" : "./webpack.config.js";
  return cb => {
    gulp
      .src(config.webpackSrc)
      .pipe(
        webpack(
          {
            config: require(configFile)
          },
          webpackCore,
          err => {
            // makes this task blocking
            cb(err);
          }
        ).on("error", err => {
          gutil.log("Webpack: " + err.message);
        })
      )
      .pipe(gulp.dest(config.dist));
  };
}

function nunjucksCfg(mode) {
  return () => {
    return gulp
      .src(config.nunjucksPages + "/**/*.html")
      .pipe(
        nunjucks({
          searchPaths: [config.nunjucksTemplates]
        })
      )
      .pipe(gulp.dest(config.dist));
  };
}

function imagesCfg(mode) {
  return () => {
    return gulp.src(config.imgSrc).pipe(gulp.dest(config.dist + "/images"));
  };
}

function loadersCfg(mode) {
  return () => {
    return tsProject
      .src()
      .pipe(tsProject())
      .js.pipe(gulp.dest(config.loadersDist));
  };
}

function browserSyncCfg(mode) {
  return () => {
    browserSync.init({
      files: [config.dist + "/**"],
      server: {
        baseDir: config.dist
      }
    });
    gulp.watch(
      [
        config.nunjucksTemplates + "/**/*.html",
        config.nunjucksPages + "/**/*.html"
      ],
      ["nunjucks" + mode]
    );
    gulp.watch(config.webpackSrc, ["webpack" + mode]);
    gulp.watch(config.sassSrc, ["sass" + mode]);
    gulp.watch(config.loadersSrc, ["webpack" + mode, "loaders" + mode]);
  };
}
