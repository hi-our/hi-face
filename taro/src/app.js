import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'
import Index from 'pages/test/test'
import store from '@/store'
import userActions from '@/store/user'
import * as config from 'config'
import globalActions from '@/store/global'

import './app.styl'

const updateManager = Taro.getUpdateManager()

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')

class App extends Component {
  config = {
    pages: [
      'pages/avatar-edit/avatar-edit',
      'pages/avatar-list/avatar-list',
      'pages/avatar-poster/avatar-poster',
      'pages/theme-list/theme-list',
      'pages/self/self'
    ],
    // plugins: {
    //   tucao: {
    //     version: '1.1.5',
    //     provider: 'wx8abaf00ee8c3202e'
    //   }
    // },
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    networkTimeout: {
      request: 20000,
      downloadFile: 10000
    },
    sitemapLocation: "sitemap.json",
    tabBar: {
      custom: true,
      backgroundColor: '#DEE8FF',
      borderStyle: 'white',
      color: '#95a1af',
      selectedColor: '#2f5aff',
      list: [
        {
          pagePath: 'pages/theme-list/theme-list',
          text: '主题',
          iconPath: 'images/tab-theme-1.png',
          selectedIconPath: 'images/tab-theme-2.png'
        },
        {
          pagePath: 'pages/avatar-edit/avatar-edit',
          text: '编辑',
          iconPath: 'images/tab-edit-1.png',
          selectedIconPath: 'images/tab-edit-2.png'
        },
        {
          pagePath: 'pages/self/self',
          text: '我的',
          iconPath: 'images/tab-self-1.png',
          selectedIconPath: 'images/tab-self-2.png'
        },
        
      ]
    },
  }

  componentWillMount() {
    // 重新启动小程序，会出现引导界面
    Taro.setStorageSync('isHideLead', false)

    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env: config.cloudEnv,
        traceUser: true
      })

      // 检查过审开关是否开启
      globalActions.getForCheckStatus()
      globalActions.getThemeList()
    }
    
    this.onUserLogin()

    this.setUpdateManager()
  }

  componentDidShow() {
    // 判断是否登录超时处理
    // userActions.checkLoginTimeout()
    const { scene, query = {} } = this.$router.params
    if (query.source) {
      Taro.setStorageSync('source', query.source)
    }

    if (scene) {
      this.addToIndexBtn(scene)
  
      // 保持小程序使用期间屏幕常亮
      Taro.setKeepScreenOn({
        keepScreenOn: true
      })

    }
  }

  // 用户登录
  onUserLogin = async () => {
    try {
      const res = await userActions.login()
    } catch (error) {
      console.log('基础登录失败，不会注册sdk', error)
    }
  }

  // 小程序更新提醒
  setUpdateManager() {

    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
  }

  /** TODO: 猜测这段代码的逻辑是，是否显示「返回首页」按钮，, query = {}暂时没用到 */
  addToIndexBtn(code) {
    const RefreshCode = {
      '011004': true
    }

    // 理论上所谓app级别进来小程序的都需要返回首页，然后单独到3个tab里面清除掉
    let sceneCode = Taro.getStorageSync('showBackToIndexBtn')
    if (!sceneCode) {
      Taro.setStorageSync('showBackToIndexBtn', RefreshCode[code] || true)
    }
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
