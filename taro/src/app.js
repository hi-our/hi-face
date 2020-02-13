import React, { Component } from 'react'
import { Provider } from 'react-redux'
import store from '@/store'
// import userActions from '@/store/user'
import * as config from 'config'


import './app.styl'

const updateManager = process.env.TARO_ENV !== 'h5' ? Taro.getUpdateManager() : null

class App extends Component {

  componentDidMount () {

    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({})
    }
    
    // this.onUserLogin()

    this.setUpdateManager()
  }

  // 用户登录
  onUserLogin = async () => {
    try {
      // const res = await userActions.login()
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
