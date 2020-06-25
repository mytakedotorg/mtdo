const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("./tsconfig.json");
const nodemon = require("gulp-nodemon");
const sourcemaps = require("gulp-sourcemaps");

const config = {
  src: "./src/main/scripts/**/*.ts",
  dist: "./src/main/dist",
};

const BUILD = "build";
const PROXY = "proxy";

gulp.task(BUILD, () => {
  return gulp
    .src(config.src)
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(config.dist));
});

gulp.task(PROXY, function() {
  nodemon({
    script: config.dist + "/server.js",
    ext: "js",
    env: { NODE_ENV: process.env.NODE_ENV },
  });
  gulp.watch(config.src, gulp.series([BUILD]));
});

gulp.task("default", gulp.series([BUILD, PROXY]));
