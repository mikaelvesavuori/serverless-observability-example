const path = require('path');
const slsw = require('serverless-webpack');

console.log('Webpack config is in', __dirname);
console.log('slsw found Entries: ', slsw.lib.entries);

module.exports = {
  mode: 'production',
  entry: slsw.lib.entries,
  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js'
  },
  optimization: {
    minimize: false
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.(js)/,
        loader: 'babel-loader',
        exclude: [path.resolve(__dirname, 'node_modules')]
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: [path.resolve(__dirname, 'node_modules')]
      }
    ]
  }
};
