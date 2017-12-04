const gulp = require("gulp");
// sass
sass = require("gulp-sass");
autoprefixer = require("gulp-autoprefixer");
notify = require("gulp-notify");
// webpack
webpackCore = require("webpack");
webpack = require("webpack-stream");
webpackServer = require("webpack-dev-server");
// file loaders
ts = require("gulp-typescript");
// misc
tasklisting = require("gulp-task-listing");
gutil = require("gulp-util");
rev = require("gulp-rev");
merge = require("gulp-merge-json");

const config = {
  dist: "./src/main/resources/assets-dev",
  distProd: "./src/main/resources/assets",
  cssSrc: "./assets/public/**/*.css",
  sassSrc: "./assets/stylesheets/**/*.?(s)css",
  imgSrc: "./assets/images/**/*.{jpg,png}",
  webpackSrc: [
    "./src/main/typescript/**/*",
    "!src/main/typescript/**/*.spec.js"
  ]
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
  const images = "images" + mode;
  const proxy = "proxy" + mode;
  gulp.task(css, cssCfg(mode));
  gulp.task(sass, sassCfg(mode));
  gulp.task(webpack, webpackCfg(mode));
  gulp.task(images, imagesCfg(mode));
  if (mode === PROD) {
    gulp.task(BUILD + mode, [css, sass, webpack, images], () => {
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
    gulp.task(BUILD + mode, [webpack, sass, images, css]);
    gulp.task(proxy, [BUILD + mode], proxyCfg(mode));
  }
}

gulp.task(
  "default",
  tasklisting.withFilters(/clean|default|css|sass|webpack|images|rev|default/)
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
  return () => {
    return fingerprint(
      mode,
      gulp.src(config.webpackSrc).pipe(
        webpack(
          {
            config: require(configFile)
          },
          webpackCore
        ).on("error", err => {
          gutil.log("Webpack: " + err.message);
        })
      )
    );
  };
}

function imagesCfg(mode) {
  return () => {
    return fingerprintAlways(mode, gulp.src(config.imgSrc));
  };
}

function proxyCfg(mode) {
  if (mode !== DEV) throw "proxyCfg is a dev-only task";

  const configFile = "./webpack.config.dev.js";
  const contentBase = "/src/main/resources/assets-dev/";
  return () => {
    var compiler = webpackCore(require(configFile));

    var server = new webpackServer(compiler, {
      inline: true,
      hot: true,
      contentBase: __dirname + contentBase,
      publicPath: contentBase,
      filename: "app.bundle.js"
    });

    server.listen(2000);
    gulp.watch(config.sassSrc, ["sass" + mode]);
    gulp.watch(config.cssSrc, ["css" + mode]);
    gulp.watch(config.imagesSrc, ["images" + mode]);
  };
}
