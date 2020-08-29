const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};

module.exports = {
  mode: 'development',
  entry: resolve('../src/app.js'),
  output: {
    filename: 'bundle.js',
    path: resolve('dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.vue/,
        use: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: true,
            },
          },
        ],
      },
    ],
    plugins: [
      new HtmlWebpackPlugin({
        template: resolve('../public/index.html'),
      })
    ],
  }
}
