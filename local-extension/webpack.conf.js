const { resolve } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtensionReloaderPlugin = require('webpack-extension-reloader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const mode = process.env.NODE_ENV;
module.exports = {
  mode,
  devtool: "inline-source-map",
  entry: {
    background: "./src/background.ts",
    "content-script": "./src/content-script.ts",
    injected: "./src/injected.ts",
    wallet: "./src/wallet.tsx"
  },
  output: {
    publicPath: ".",
    path: resolve(__dirname, "dist/"),
    filename: "[name].bundle.js",
    libraryTarget: "umd"
  },
  plugins: [
    /***********************************************************************/
    /* By default the plugin will work only when NODE_ENV is "development" */
    /***********************************************************************/
    new ExtensionReloaderPlugin({
      entries: {
        contentScript: "content-script",
        background: "background",
        extensionPage: "popup"
      }
      // Also possible to use
      // manifest: resolve(__dirname, "manifest.json")
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from:
            process.env.NODE_ENV === "development"
              ? "./extension/manifest.dev.json"
              : "./extension/manifest.prod.json",
          to: "manifest.json"
        },
        { from:"./extension/icons" }
      ],
    }),

    new webpack.EnvironmentPlugin(['REACT_APP_PK', 'REACT_APP_ERC20_ADDRESS']),
    new HtmlWebpackPlugin({
      filename: 'wallet.html',
      chunks: [ 'wallet' ],
      templateContent: `<html><body><div id="root"></div></body></html>`,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.txt$/,
        use: "raw-loader"
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.json' ],
  },
};
