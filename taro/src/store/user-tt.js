import Taro from 'react'
import mirror from 'mirror'
import PassTtSDK from '@hujiang/passport-bytedance-sdk'
import * as config from 'config'
import { LOGIN_STATUS } from 'constants/status'
import EventEmitter from 'utils/EventEmitter'

let $ttpass = null
let stPassTimeOut = ''

const TIMEOUT_COUNT = 2000
const sdkParams = {
  // pass 不区分 qa123，都是 qa
  env: config.env.includes('qa') ? 'qa' : config.env,
  appId: config.appId,
  userDomain: 'cc',
  businessDomain: 'yyy_cctalk_dy'
}

export const getPassSdk = () => $ttpass

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
    isClubAuthValid() {
      const clubAuth = Taro.getStorageSync('ClubAuth')
      const time = Taro.getStorageSync('ClubAuth_Time')
      return clubAuth && Date.now() < time
    },
    loginSuccessEmitter(loginStatus) {
      if (loginStatus === LOGIN_STATUS.SUCCESS) {
        Taro.setStorageSync('ClubAuth_Time', Date.now() + 13.9 * 24 * 60 * 60 * 1000)
      }
      console.log('loginSuccessEmitter', loginStatus)
      EventEmitter.emit('login-callback-status', loginStatus)
    },
    login() {
      // 先获取一次老的clubAuth用于请求数据
      let clubAuth = Taro.getStorageSync('ClubAuth')
      if (!clubAuth) {
        this.setLoginStatus(LOGIN_STATUS.NOT_INIT)
      }
      this.setLoginInfo({
        userInfo: {
          clubAuth: clubAuth || ''
        }
      })
      return new Promise((resolve, reject) => {
        // 初始化 pass sdk 并尝试登录
        // PassTtSDK
        $ttpass = new PassTtSDK({
          ...sdkParams,
          suc: (res) => {
            this.sdkInitSuccess(res)
            resolve(res)
          },
          fail: (error) => {
            console.log(error, '初始化sdk失败，重试ing')
            reject(error)
            this.reInitPassSDK()
          }
        })
      })
    },
    getHJUserInfo(clubAuth) {
      $ttpass.getHJUserInfo({
        cookie: clubAuth
      }, (res2) => {
        if (res2.status === 0) {
          const { Avatar, Nick, Username, Mobile, UserId, userId } = res2.data
          let _userId = userId || UserId
          let userInfo = {
            userId: _userId,
            nickName: Nick || Username,
            avatar: Avatar,
            mobile: Mobile,
            clubAuth: clubAuth,
          }
          this.loginSuccessEmitter(LOGIN_STATUS.SUCCESS)
          this.setLoginInfo({
            loginStatus: _userId > 0 ? LOGIN_STATUS.SUCCESS : '',
            userInfo
          })
        }
        clearTimeout(stPassTimeOut)
      }, (err) => {
        console.log('err', err)
      })
    },
    sdkInitSuccess(res) {
      const { openId } = res.data
      // 保存 openId
      this.setLoginInfo({
        userInfo: {
          openId: openId,
        }
      })

      const clubAuth = Taro.getStorageSync('ClubAuth')
      if (clubAuth) {
        this.getHJUserInfo(clubAuth)

        // 续命
        $ttpass.refreshCookie({ cookie: clubAuth }, () => {
          console.log('续命成功')
        }, () => {
          stPassTimeOut = setTimeout(() => {
            this.loginSuccessEmitter(LOGIN_STATUS.TIMEOUT)
            this.setLoginInfo({ loginStatus: LOGIN_STATUS.TIMEOUT })
          }, TIMEOUT_COUNT)
          Taro.removeStorageSync('ClubAuth')
        })
      }
    },
    /** 尝试再次初始化 sdk */
    reInitPassSDK() {
      if (!$ttpass) {
        return false
      }

      if ($ttpass.initialized) {
        return false
      }

      $ttpass.initialize({
        ...sdkParams,
        suc: this.sdkInitSuccess,
        fail: (res) => {
          this.setLoginInfo({
            userInfo: {
              clubAuth: ''
            },
            loginStatus: LOGIN_STATUS.TIMEOUT
          })
          this.loginSuccessEmitter(LOGIN_STATUS.TIMEOUT)
          console.log(res, '第二次初始化sdk失败，登陆失败')
        }
      })
    },
    checkLoginTimeout() {
      if (!Taro.getStorageSync('ClubAuth')) {
        stPassTimeOut = setTimeout(() => {
          this.loginSuccessEmitter(LOGIN_STATUS.TIMEOUT)
          this.setLoginInfo({
            loginStatus: LOGIN_STATUS.TIMEOUT
          })
        }, TIMEOUT_COUNT)
      }
    },
    logout() {
      Taro.clearStorageSync()
      this.setLoginInfo({
        loginStatus: LOGIN_STATUS.OUT,
        userInfo: Object.assign({}, defaultUserInfo)
      })
    }
  }
})

export default userActions
