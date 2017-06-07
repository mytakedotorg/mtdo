module.exports = {
  entry: __dirname + "/src/index.tsx",
  output: {
    filename: "bundle.js",
    path: __dirname + "/docs"
  },

  // Enable sourcemaps for debugging webpack's output.
  //devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { 
        test: /\.tsx?$/,
        exclude: /node_modules/, 
        loader: "awesome-typescript-loader" 
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
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
        test: /\.html/,
        use: [{
          loader: 'html-loader'
        }]
      }
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
};