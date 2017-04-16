import { resolve } from 'path'
import webpack from 'webpack'

module.exports = {
  entry: './src/index.js',

  output: {
    filename: 'index.js',
    path: resolve('./build/'),
    library: 'ReduxScalable'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/i
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

  resolve: {
    modules: [
      'src/',
      'node_modules/'
    ],

    extensions: [
      '.js'
    ]
  }
}
