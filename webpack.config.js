const WebpackPwaManifest = require("webpack-pwa-manifest");

//Webpack configuration object
const config = {
  entry: "./public/src/index.js", // entry: What is the main js file that will list the dependencies being used.
  output: {
    //output: Where do you want the bundled js file that is being created to live. Must take in an absolute path
    path: __dirname + "/public/dist", //The directory where the new bundled file goes.
    filename: "bundle.js" //The new bundled file that is created.
  },
  mode: "development", // Development mode: 'run webpack' will build the bundle.js file in the dist directory.
  //Setting Production mode will then minify the bundle.js file
  plugins: [
    new WebpackPwaManifest({
      // Genertates the manifest.json file
      name: "Budget Tracker",
      short_name: "Budget Tracker",
      description: "An application for managing a users budget",
      background_color: "#01579b",
      theme_color: "#ffffff",
      start_url: "/"
    })
  ],
  // configure webpack to use babel-loader to bundle our separate modules and transpile the code
  // refer to https://github.com/babel/babel-loader for more information on the settings
  module: {
    rules: [
      {
        test: /\.js$/, // files must end in ".js" to be transpiled
        exclude: /node_modules/, // don't transpile code from "node_modules"
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};

module.exports = config;
