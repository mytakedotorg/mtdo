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
tsLoaders = ts.createProject("./loaders/tsconfig.json");
tsScripts = ts.createProject("./test/scripts/tsconfig.json");
// misc
browserSync = require("browser-sync").create();
tasklisting = require("gulp-task-listing");
del = require("del");
gutil = require("gulp-util");
rev = require("gulp-rev");
merge = require("gulp-merge-json");

const config = {
  dist: "../server/src/main/resources/assets-dev",
  distProd: "../server/src/main/resources/assets",
  cssSrc: "./assets/public/**/*.css",
  sassSrc: "./assets/stylesheets/**/*.?(s)css",
  imgSrc: "./assets/images/**/*.{jpg,png}",
  webpackSrc: ["./src/**/*", "!src/**/*.spec.js"],
  nunjucksTemplates: "./nunjucks/templates",
  nunjucksPages: "./nunjucks/pages",
  loadersSrc: "./loaders/src/**/*.ts",
  loadersDist: "./loaders/dist",
  scriptsSrc: "./test/scripts/src/**/*.ts",
  scriptsDist: "./test/scripts/dist"
};

///////////////////////////////
// Create dev and prod tasks //
///////////////////////////////
const BUILD = "build";
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
  const scripts = "scripts" + mode;
  const scriptsWatch = "scriptsWatch" + mode;
  gulp.task(css, cssCfg(mode));
  gulp.task(sass, sassCfg(mode));
  gulp.task(loaders, loadersCfg(mode));
  gulp.task(webpack, [loaders], webpackCfg(mode));
  gulp.task(nunjucks, [webpack], nunjucksCfg(mode));
  gulp.task(images, imagesCfg(mode));
  gulp.task(scripts, scriptsCfg(mode));
  gulp.task(scriptsWatch, scriptsWatchCfg(mode));
  if (mode === PROD) {
    gulp.task(BUILD + mode, [nunjucks, sass, images, css], () => {
      return gulp
        .src(config.distProd + "/*.json")
        .pipe(
          merge({
            fileName: "manifest.json"
          })
        )
        .pipe(gulp.dest(config.distProd));
    });
  } else {
    gulp.task(BUILD + mode, [nunjucks, sass, images, css]);
    gulp.task("proxy" + mode, [BUILD + mode], proxyCfg(mode));
  }
}

gulp.task(
  "default",
  tasklisting.withFilters(
    /clean|default|css|sass|webpack|nunjucks|images|loaders|rev|scripts|default/
  )
);

// these resources are fingerprinted in PROD and in DEV,
// and don't show up in the manifest.mf
//
// they need to be referred to only by their fingerprinted value
function fingerprintAlways(mode, stream) {
  return stream.pipe(rev()).pipe(gulp.dest(config.distProd));
}

// these resources end up with a translation to their name
// in the manifest.json, which our app will translate to the
// correct links for us in prod
var revCount = 0;
function fingerprint(mode, stream) {
  ++revCount;
  if (mode === PROD) {
    // workaround for https://github.com/sindresorhus/gulp-rev/issues/205
    return stream
      .pipe(rev())
      .pipe(gulp.dest(config.distProd))
      .pipe(
        rev.manifest(revCount + ".json", {
          merge: true
        })
      )
      .pipe(gulp.dest(config.distProd));
  } else {
    return stream.pipe(gulp.dest(config.dist));
  }
}

//////////////////////
// Config functions //
//////////////////////
function cssCfg(mode) {
  return () => {
    return fingerprint(mode, gulp.src(config.cssSrc));
  };
}

function sassCfg(mode) {
  return () => {
    return fingerprint(
      mode,
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
    );
  };
}

function webpackCfg(mode) {
  const configFile =
    mode === DEV ? "./webpack.config.dev.js" : "./webpack.config.js";
  return cb => {
    fingerprint(
      mode,
      gulp.src(config.webpackSrc).pipe(
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
    );
  };
}

function nunjucksCfg(mode) {
  return () => {
    return gulp.src(config.nunjucksPages + "/**/*.html").pipe(
      nunjucks({
        searchPaths: [config.nunjucksTemplates]
      })
    );
  };
}

function imagesCfg(mode) {
  return () => {
    return fingerprintAlways(mode, gulp.src(config.imgSrc));
  };
}

function loadersCfg(mode) {
  return () => {
    return tsLoaders
      .src()
      .pipe(tsLoaders())
      .js.pipe(gulp.dest(config.loadersDist));
  };
}

function scriptsCfg(mode) {
  return () => {
    return tsScripts
      .src()
      .pipe(tsScripts())
      .js.pipe(gulp.dest(config.scriptsDist));
  };
}

function scriptsWatchCfg(mode) {
  return () => {
    gulp.watch(config.scriptsSrc, ["scripts" + mode]);
  };
}

function proxyCfg(mode) {
  return () => {
    browserSync.init({
      proxy: "localhost:8080",
      files: config.dist + "/**",
      serveStatic: [
        {
          route: "/assets-dev",
          dir: config.dist
        }
      ]
    });
    gulp.watch(config.webpackSrc, ["webpack" + mode]);
    gulp.watch(config.sassSrc, ["sass" + mode]);
    gulp.watch(config.cssSrc, ["css" + mode]);
    gulp.watch(config.imagesSrc, ["images" + mode]);
    gulp.watch(config.loadersSrc, ["webpack" + mode, "loaders" + mode]);
  };
}
