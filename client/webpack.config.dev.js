const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: {
    app: __dirname + "/src/main/typescript/index.tsx",
    takeReader: __dirname + "/src/main/typescript/takeReader.tsx",
    window: __dirname + "/src/main/typescript/utils/window.ts"
  },

  output: {
    filename: "[name].bundle.js",
    path: __dirname + "/dist/"
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  resolveLoader: {
    modules: ["node_modules", __dirname + "/loaders/dist"]
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "awesome-typescript-loader"
      },

      // All files with a '.html' extension will be handled by 'html-loader'.
      {
        test: /\.foundation\.html$/,
        loaders: ["html-loader", "foundation-loader"]
      },

      {
        test: /\.vtt$/,
        loader: ["html-loader", "vtt-loader"]
      }
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    vis: "vis"
  }
};
