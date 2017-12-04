const gulp = require("gulp");
// sass
sass = require("gulp-sass");
autoprefixer = require("gulp-autoprefixer");
notify = require("gulp-notify");
// webpack
webpack = require("webpack");
webpackStream = require("webpack-stream");
browserSync = require("browser-sync");
serveStatic = require("serve-static");
UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const { CheckerPlugin } = require("awesome-typescript-loader");
webpackDevMiddleware = require("webpack-dev-middleware");
webpackHotMiddleware = require("webpack-hot-middleware");
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
    gulp.task(proxy, proxyCfg(mode));
  }
}

function webpackEntryFor(mode, filename) {
  if (mode === DEV) {
    return [
      "webpack/hot/dev-server",
      "webpack-hot-middleware/client",
      __dirname + filename
    ];
  } else {
    return [__dirname + filename];
  }
}

function webpackSettings(mode) {
  return {
    entry: {
      app: webpackEntryFor(mode, "/src/main/typescript/index.tsx"),
      window: webpackEntryFor(mode, "/src/main/typescript/utils/window.ts")
    },
    output: {
      filename: "[name].bundle.js"
    },
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx", ".js"]
    },
    plugins:
      mode === PROD
        ? [new webpack.optimize.UglifyJsPlugin()]
        : [
            new CheckerPlugin(), // needed for hotreload on typescript
            new webpack.HotModuleReplacementPlugin()
          ],
    resolve: {
      extensions: [".ts", ".tsx", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          include: __dirname + "/src/main/typescript",
          loaders:
            mode === PROD
              ? ["awesome-typescript-loader"]
              : [
                  "react-hot-loader/webpack",
                  "awesome-typescript-loader",
                  "webpack-module-hot-accept"
                ]
        }
      ]
    }
  };
}

gulp.task(
  "default",
  tasklisting.withFilters(/clean|css|sass|webpack|images|proxy|default/)
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
  return () => {
    return fingerprint(
      mode,
      gulp.src(config.webpackSrc).pipe(
        webpackStream(
          {
            config: webpackSettings(mode)
          },
          webpack
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
  return () => {
    const bundler = webpack(webpackSettings(mode));
    browserSync.init({
      proxy: "localhost:8080",
      middleware: [
        webpackDevMiddleware(bundler, {
          publicPath: "/assets-dev/",
          stats: { colors: true }
        }),
        webpackHotMiddleware(bundler),
        {
          route: "/assets-dev",
          handle: serveStatic(config.dist)
        }
      ]
    });
    gulp.watch(config.sassSrc, ["sass" + mode]);
    gulp.watch(config.cssSrc, ["css" + mode]);
  };
}
