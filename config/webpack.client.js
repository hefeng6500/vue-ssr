const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin'); 
const base = require('./webpack.base');

const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};

module.exports = merge(base, {
  entry: {
    client: resolve('../src/entry-client.js'),
  },
  plugins: [
    new VueSSRClientPlugin(),
    new HtmlWebpackPlugin({
      template: resolve('../public/index.client.html'),
    }),
  ],
});
