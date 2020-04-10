import React, { Component } from 'react'
import Taro from '@tarojs/taro';
import { Provider } from 'react-redux'
import * as tcb from 'tcb-js-sdk'
import adapterForQQ from '@cloudbase/adapter-qq_mp';
import store from '@/store'
import userActions from '@/store/user'
import * as config from 'config'


import './app.styl'

const updateManager = process.env.TARO_ENV !== 'h5' ? Taro.getUpdateManager() : null

class App extends Component {

  componentWillMount() {

    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env: config.cloudEnv,
        traceUser: true
      })
    } else if (process.env.TARO_ENV === 'h5' || process.env.TARO_ENV === 'qq') {
      console.log('tcb :', tcb, process.env.TARO_ENV );
      let initConfig = {}
      // tcb.useAdapters([adapterForQQ]);
      // initConfig = {
      //   appSign: process.env.appSign,
      //   appSecret: {
      //     appAccessKeyId: process.env.appAccessKeyId,
      //     appAccessKey: process.env.appAccessKey,
      //   }
      // }
      // hack写法？呼呼
      Taro.cloud = tcb.init({
        env: config.cloudEnv,
        ...initConfig
      })
      // console.log('登录云开发成功！')
      Taro.cloud.auth().signInAnonymously().then(() => {
        Taro.cloud.callFunction({
          name: 'thanks-data',
          data: {
            1: 1
          }
        }).then(res => console.log('res ', res))


      }).catch(error => {
        console.log('error :', error);
      })
    }
    
    this.onUserLogin()

    this.setUpdateManager()
  }

  // TODO 这里还要看一下文档
  // componentDidShow() {
  //   // 判断是否登录超时处理
  //   // userActions.checkLoginTimeout()

  //   console.log('this.$router :', this.$router);
  //   const { scene, query = {} } = this.$router.params
  //   if (query.source) {
  //     Taro.setStorageSync('source', query.source)
  //   }
  //   console.log('scene, query', scene, query)

  //   if (scene) {
  //     this.addToIndexBtn(scene)
  
  //     // 保持小程序使用期间屏幕常亮
  //     Taro.setKeepScreenOn({
  //       keepScreenOn: true
  //     })

  //   }
  // }

  // 用户登录
  onUserLogin = async () => {
    try {
      const res = await userActions.login()
      // wx.bisdk && wx.bisdk.setOpenIdInfo && wx.bisdk.setOpenIdInfo(res)

      // 获取注册来源示例
      // if (wx.bisdk && wx.bisdk.getRegSource) {
      //   console.log('wx.bisdk.getRegSource', wx.bisdk.getRegSource())
      // }

    } catch (error) {
      console.log('基础登录失败，不会注册sdk', error)
    }
  }

  // 小程序更新提醒
  setUpdateManager() {
    if (!updateManager) return

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
        {this.props.children}
      </Provider>
    )
  }
}
export default App
