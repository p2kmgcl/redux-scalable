import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'ReduxScalable',
  dest: 'build/index.js',
  sourceMap: true,
  plugins: [
    babel({ exclude: ['node_modules/**'] })
  ],
  external: [
    'immutable',
    'reselect'
  ],
  globals: {
    'immutable': 'Immutable',
    'reselect': 'Reselect'
  }
}
