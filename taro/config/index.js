const alias = require('./alias')
const loadEnv = require('../load-env')

loadEnv()


// 兼容web端和小程序端
const dpr = process.env.TARO_ENV === 'h5' ? 1 : 2


const config = {
  projectName: 'quickly-mask',
  date: '2019-11-2',
  designWidth: 375 * dpr,
  deviceRatio: {
    640: 2.34 / 2 / dpr,
    750: 1 / 1 / dpr,
    828: 1.81 / 2 / dpr
  },
  sourceRoot: 'src',
  outputRoot: process.env.TARO_ENV === 'h5' ? 'dist-h5' : 'dist',
  babel: {
    sourceMap: true,
    presets: [
      [
        'env',
        {
          modules: false
        }
      ]
    ],
    plugins: [
      'transform-decorators-legacy',
      'transform-class-properties',
      'transform-object-rest-spread',
      ['transform-runtime', {
        helpers: false,
        polyfill: false,
        regenerator: true,
        moduleName: 'babel-runtime'
      }]
    ]
  },
  defineConstants: {
    'process.env.SERVER_ENV': JSON.stringify(process.env.SERVER_ENV),
    'process.env.APPID_ENV': JSON.stringify(process.env.APPID_ENV),
    'process.env.MOCK': JSON.stringify(process.env.MOCK),
    'process.env.appSign': JSON.stringify(process.env.appSign),
    'process.env.appAccessKeyId': JSON.stringify(process.env.appAccessKeyId),
    'process.env.appAccessKey': JSON.stringify(process.env.appAccessKey),
  },
  alias,
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
          limit: 10240 // 设定转换尺寸上限
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
