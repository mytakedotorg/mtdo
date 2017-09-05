const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: {
    app: __dirname + "/src/index.tsx",
    blockEditor: __dirname + "/src/blockEditor.tsx",
    documentReader: __dirname + "/src/documentReader.tsx",
    foundation: __dirname + "/src/foundationView.tsx",
    foundationExplorer: __dirname + "/src/foundationExplorer.tsx"
  },

  output: {
    filename: "[name].bundle.js",
    path: __dirname + "/dist/"
  },

  // Enable sourcemaps for debugging webpack's output.
  //devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", ".jpg"]
  },
  resolveLoader: {
    modules: ["node_modules", __dirname + "/loaders"]
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "awesome-typescript-loader"
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "source-map-loader"
      },

      // All files with a '.html' extension will be handled by 'html-loader'.
      {
        test: /\.foundation\.html$/,
        loaders: ["html-loader", "foundation-loader"]
      },

      {
        test: /\.(png|jpg)$/,
        loader: "url-loader?limit=8192"
      } // inline base64 URLs for <=8k images, direct URLs for the rest
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    react: "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    // new UglifyJSPlugin({
    //   sourceMap: true
    // })
  ]
};
