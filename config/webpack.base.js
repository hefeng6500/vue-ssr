const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const resolve = (dir) => {
  path.resolve(__dirname, dir);
};

module.exports = {
  mode: 'development',
  output: {
    filename: '[name].bundle.js',
    path: resolve('../dist'),
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
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
