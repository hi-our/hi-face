import Taro from '@tarojs/taro'
import mirror from 'mirror'
import * as config from 'config'
import { LOGIN_STATUS } from 'constants/status'
import EventEmitter from 'utils/event-emitter'
import { cloudCallFunction } from 'utils/fetch';

export const modelName = 'user'



const defaultUserInfo = {
  clubAuth: '',
  nickName: '',
  avatar: '',
  userId: 0,
  mobile: 0
}

/**
 * 记录用户信息、登录状态
 */
const userActions = mirror.model({
  name: modelName,
  initialState: {
    // 登录成功、未登录、登录超时
    // 等同于isLogin
    // 但存在着clubAuth存在但无效，比如登录后14天刷新cookie失败
    loginStatus: LOGIN_STATUS.LOADING,
    // userInfo userId才是登录完成的最终状态
    userInfo: Object.assign({}, defaultUserInfo)
  },
  reducers: {
    setLoginStatus(state, loginStatus) {
      return {
        ...state,
        loginStatus,
      }
    },
    setLoginInfo(state, payload) {
      const { userInfo = {}, loginStatus } = payload
      return {
        ...state,
        loginStatus: loginStatus || state.loginStatus,
        userInfo: {
          ...state.userInfo,
          ...userInfo
        },
      }
    },
  },
  effects: {
    loginSuccessEmitter(loginStatus) {
      if (loginStatus === LOGIN_STATUS.SUCCESS) {
        Taro.setStorageSync('ClubAuth_Time', Date.now() + 13.9 * 24 * 60 * 60 * 1000)
      }
      EventEmitter.emit('login-callback-status', loginStatus)
    },
    async login() {
      
      try {
        const userInfo = await cloudCallFunction({
          name: 'login',
        })
        const { wechatInfo = {}, userId } = userInfo

        this.setLoginInfo({
          loginStatus: userId ? LOGIN_STATUS.SUCCESS : '',
          userInfo
        })
        this.loginSuccessEmitter(LOGIN_STATUS.SUCCESS)
        console.log('userInfo :', userInfo)

        if (!wechatInfo.avatarUrl) {
          this.getWxInfo()
        }
      } catch (error) {
        this.loginSuccessEmitter(LOGIN_STATUS.TIMEOUT)
        this.setLoginInfo({ loginStatus: LOGIN_STATUS.TIMEOUT })
      }
    },
    async getWxInfo() {
      const setting = await Taro.getSetting()
      if (setting.authSetting['scope.userInfo']) {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        const res = await Taro.getUserInfo({
          lang: 'zh_CN',
        })
        console.log('res', res, res.userInfo)

        cloudCallFunction({
          name: 'login',
          data: {
            type: 'saveWechatInfo',
            wechatInfo: res.userInfo
          }
        }).then(() => {
          this.setLoginInfo({
            userInfo: {
              wechatInfo: res.userInfo
            }
          })
          
        })

      }
    }
  }
})
export default userActions