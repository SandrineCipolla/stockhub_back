const path = require("path");
const nodeExternals = require("webpack-node-externals");

//    externals: [nodeExternals()], // Exclut `node_modules` du bundle
module.exports = {
  entry: "./src/index.ts",
  target: "node",
  // externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
};
