const resolve = require('path').resolve

module.exports = {
  entry: './src/index.js',
  output: {
    path: resolve('./build'),
    filename: 'index.js',
    library: 'ReduxScalable',
    libraryTarget: 'umd',
    devtoolLineToLine: true
  },
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: [/node_modules/],
        loader: 'babel-loader'
      }
    ]
  },
  externals: [
    'reselect',
    'immutable',
    'redux',
    'redux-immutable'
  ],
  devtool: 'source-map'
}
