export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'ReduxScalable',
  dest: 'build/index.js',
  external: [
    'immutable',
    'reselect'
  ],
  globals: {
    'immutable': 'Immutable',
    'reselect': 'Reselect'
  }
}
