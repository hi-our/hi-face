const alias = require('./alias')

const config = {
  projectName: 'goddess-hat',
  date: '2020-01-28',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 4,
    750: 1 / 2,
    828: 1.81 / 4
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  // babel: {
  //   sourceMap: true,
  //   presets: [
  //     [
  //       'env',
  //       {
  //         modules: false
  //       }
  //     ]
  //   ],
  //   plugins: [
  //     'transform-decorators-legacy',
  //     'transform-class-properties',
  //     'transform-object-rest-spread',
  //     ['transform-runtime', {
  //       helpers: false,
  //       polyfill: false,
  //       regenerator: true,
  //       moduleName: 'babel-runtime'
  //     }]
  //   ]
  // },
  defineConstants: {
    'process.env.SERVER_ENV': JSON.stringify(process.env.SERVER_ENV),
    'process.env.APPID_ENV': JSON.stringify(process.env.APPID_ENV),
    'process.env.MOCK': JSON.stringify(process.env.MOCK),
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  alias,
  framework: 'react',
  mini: {
    imageUrlLoaderOption: {
      limit: 0
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }

  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-cropper'],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
          browsers: [
            'last 3 versions',
            'Android >= 4.1',
            'ios >= 8'
          ]
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
