const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const nodemon = require("nodemon");

const config = {
  src: "./src/main/scripts/**/*",
  dist: "./src/main/dist"
};

const BUILD = "build";
const PROXY = "proxy";

gulp.task(BUILD, function() {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(config.dist));
});

gulp.task(PROXY, function() {
  nodemon({
    script: config.dist + "/server.js",
    ext: "js",
    env: { NODE_ENV: "development" }
  });
  gulp.watch(config.src, [BUILD]);
});

gulp.task("default", [BUILD, PROXY]);
