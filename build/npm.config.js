const path = require('path')

module.exports = [
  {
    mode: 'production',
    entry: './lib/index.js',
    output: {
      path: path.resolve(__dirname, '../src'),
      filename: 'index.js',
      library: 'AppInfoParser',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use:{
            loader: 'babel-loader',
          },
          exclude: /node_modules/
        }
      ]
    },
    externals: {
      bytebuffer: {
        commonjs: 'bytebuffer',
        commonjs2: 'bytebuffer',
        amd: 'bytebuffer'
      },
      'cgbi-to-png': {
        commonjs: 'cgbi-to-png',
        commonjs2: 'cgbi-to-png',
        amd: 'cgbi-to-png'
      },
      'isomorphic-unzip': {
        commonjs: 'isomorphic-unzip',
        commonjs2: 'isomorphic-unzip',
        amd: 'isomorphic-unzip'
      },
      plist: {
        commonjs: 'plist',
        commonjs2: 'plist',
        amd: 'plist'
      }
    },
    node: {
      fs: 'empty'
    }
  }
]
