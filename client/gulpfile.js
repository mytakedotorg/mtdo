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
const { CheckerPlugin } = require("awesome-typescript-loader");
webpackDevMiddleware = require("webpack-dev-middleware");
webpackHotMiddleware = require("webpack-hot-middleware");
// misc
tasklisting = require("gulp-task-listing");
rev = require("gulp-rev");
merge = require("gulp-merge-json");

const config = {
  distDev: "./src/main/resources/assets-dev",
  distProd: "./src/main/resources/assets",
};

function src(type) {
  return "./src/main/" + type + "/";
}

function dst(mode, type) {
  return (mode === DEV ? config.distDev : config.distProd) + "/" + type;
}

///////////////////////////////
// Create dev and prod tasks //
///////////////////////////////
const DEV = "Dev";
const PROD = "Prod";
const STYLES = "styles";
const SCRIPTS = "scripts";
const PERMANENT = "permanent";

setupPipeline(DEV);
setupPipeline(PROD);

function setupPipeline(mode) {
  const styles = STYLES + mode;
  const scripts = SCRIPTS + mode;
  gulp.task(styles, stylesTask(mode, STYLES));
  gulp.task(scripts, scriptsTask(mode, SCRIPTS));
  if (mode === PROD) {
    // depends on styles and scripts, inside of build.gradle
    gulp.task("rev" + PROD, () => {
      return gulp
        .src([
          config.distProd + "/" + SCRIPTS + "/manifest.json",
          config.distProd + "/" + STYLES + "/manifest.json",
        ])
        .pipe(
          merge({
            fileName: "manifest.json",
          })
        )
        .pipe(gulp.dest(config.distProd));
    });
  } else {
    gulp.task("proxy" + mode, proxyTask(mode));
  }
}

gulp.task(
  "default",
  tasklisting.withFilters(/clean|styles|scripts|proxy|default/)
);

// these resources end up with a translation to their name
// in the manifest.json, which our app will translate to the
// correct links for us in prod
function fingerprint(mode, type, stream) {
  if (mode === PROD) {
    // workaround for https://github.com/sindresorhus/gulp-rev/issues/205
    return stream
      .pipe(rev())
      .pipe(gulp.dest(dst(mode, type)))
      .pipe(
        rev.manifest(type + "/manifest.json", {
          merge: false,
        })
      )
      .pipe(gulp.dest(config.distProd));
  } else {
    return stream.pipe(gulp.dest(dst(mode, type)));
  }
}

// these resources are fingerprinted in PROD and in DEV,
// and don't show up in the manifest.mf
//
// they need to be referred to only by their fingerprinted value
gulp.task(PERMANENT, () => {
  return gulp
    .src(src(PERMANENT) + "**")
    .pipe(rev())
    .pipe(gulp.dest(dst(PROD, PERMANENT)));
});

function stylesTask(mode, type) {
  return () => {
    return fingerprint(
      mode,
      type,
      gulp
        .src(src(type) + "*")
        .pipe(
          sass({
            style: "compressed",
          }).on(
            "error",
            notify.onError(function (error) {
              return "Error: " + error.message;
            })
          )
        )
        .pipe(autoprefixer({ cascade: false, browsers: ["> 0.25%"] }))
    );
  };
}

/////////////
// WEBPACK //
/////////////
function webpackCfg(mode) {
  function entryFor(mode, filename) {
    if (mode === DEV) {
      return [
        "webpack/hot/dev-server",
        "webpack-hot-middleware/client",
        __dirname + filename,
      ];
    } else {
      return [__dirname + filename];
    }
  }
  return {
    mode: mode === PROD ? "production" : "development",
    entry: {
      app: entryFor(mode, "/src/main/scripts/index.tsx"),
    },
    output: {
      filename: "[name].bundle.js",
    },
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx", ".js"],
    },
    plugins:
      mode === PROD
        ? []
        : [
            new CheckerPlugin(), // needed for hotreload on typescript
            new webpack.HotModuleReplacementPlugin(),
          ],
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/,
            __dirname + "/src/main/scripts/utils/drawVideoFact.ts",
          ],
          use:
            mode === PROD
              ? [{ loader: "awesome-typescript-loader" }]
              : [
                  { loader: "react-hot-loader/webpack" },
                  { loader: "awesome-typescript-loader" },
                  { loader: "webpack-module-hot-accept" },
                ],
        },
      ],
    },
    externals: {
      react: "React",
      "react-dom": "ReactDOM",
      vis: "vis",
    },
  };
}

function scriptsTask(mode, type) {
  return () => {
    return fingerprint(
      mode,
      type,
      gulp.src(src(type) + "**").pipe(
        webpackStream(
          {
            config: webpackCfg(mode),
          },
          webpack
        )
      )
    );
  };
}

function proxyTask(mode) {
  if (mode !== DEV) throw "proxyCfg is a dev-only task";
  return () => {
    const bundler = webpack(webpackCfg(mode));
    browserSync.init({
      proxy: "localhost:8080",
      middleware: [
        webpackDevMiddleware(bundler, {
          publicPath: "/assets-dev/" + SCRIPTS,
          stats: { colors: true },
        }),
        webpackHotMiddleware(bundler),
      ],
      files: [config.distDev + "/" + STYLES + "/**", src(PERMANENT) + "**"],
      serveStatic: [
        {
          route: "/assets-dev/" + STYLES,
          dir: config.distDev + "/" + STYLES,
        },
      ],
    });
    gulp.watch(src(STYLES) + "**", gulp.series(STYLES + mode));
  };
}
