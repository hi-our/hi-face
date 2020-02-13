/*
有unionId，有clubAuth，clubAuth有效，才是登录成功
有unionId，有clubAuth，clubAuth无效，还需要通过unionId重新获取clubAut后，才是登录成功
有unionId，无clubAuth，还需要通过unionId重新获取clubAuth后，才是登录成功
无UnionId，有ClubAuth，clubAuth有效，才是登录成功
无UnionId，无ClubAuth，clubAuth无效，登录失败
*/

import Taro from 'react'
import mirror from 'mirror'
import PassWxSDK from '@hujiang/passport-wechat-sdk'
import * as config from 'config'
import { LOGIN_STATUS } from 'constants/status'
import EventEmitter from 'utils/event-emitter'

let $wxpass = null
let stPassTimeOut = ''

const TIMEOUT_COUNT = 6000
const sdkParams = {
  // pass 不区分 qa123，都是 qa
  env: config.env.includes('qa') ? 'qa' : config.env,
  appId: config.appId,
  userDomain: 'cc',
}

export const getPassSdk = () => $wxpass

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
    _getLoginInfo(state) {
      return state
    },
  },
  effects: {
    async getLoginInfo() {
      const { loginStatus, userInfo } = await this.getState()
      return {
        loginStatus,
        userInfo
      }
    },
    isClubAuthValid() {
      const clubAuth = Taro.getStorageSync('ClubAuth')
      const time = Taro.getStorageSync('ClubAuth_Time')
      return clubAuth && Date.now() < time
    },
    loginSuccessEmitter(loginStatus) {
      if (loginStatus === LOGIN_STATUS.SUCCESS) {
        Taro.setStorageSync('ClubAuth_Time', Date.now() + 13.9 * 24 * 60 * 60 * 1000)
      }
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
        $wxpass = new PassWxSDK({
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
    // 获取沪江用户信息，包含userId,Username,Nick,Avatar,Mobile(隐藏部分数字)
    // 需要同微信或抖音的头像昵称做区别
    getHJUserInfo(clubAuth) {
      $wxpass.getHJUserInfo({
        cookie: clubAuth
      }, (res2) => {
        if (res2.status === 0) {
          const { Avatar, Nick, Username, Mobile, UserId, userId } = res2.data
          let _userId = userId ||UserId
          let userInfo = {
            userId: _userId,
            nickName: Nick || Username,
            avatar: Avatar,
            mobile: Mobile,
            clubAuth: clubAuth,
          }
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
      const { unionId, openId } = res.data
      const clubAuth = Taro.getStorageSync('ClubAuth')
      // 保存 openId
      this.setLoginInfo({
        userInfo: {
          openId,
          unionId,
        }
      })
      
      
      if (clubAuth) {
        // 续命
        $wxpass.refreshCookie({ cookie: clubAuth }, () => {
          // 获取沪江用户头像等细节
          // this.getHJUserInfo(clubAuth)
          console.log('续命成功')
          this.setLoginInfo({
            loginStatus: LOGIN_STATUS.SUCCESS,
            userInfo: {
              clubAuth
            }
          })
          this.loginSuccessEmitter(LOGIN_STATUS.SUCCESS)
          clearTimeout(stPassTimeOut)
        }, () => {
          stPassTimeOut = setTimeout(() => {
            this.loginSuccessEmitter(LOGIN_STATUS.TIMEOUT)
            this.setLoginInfo({ loginStatus: LOGIN_STATUS.TIMEOUT })
          }, TIMEOUT_COUNT)
          Taro.removeStorageSync('ClubAuth')
          this.retryGetClubAuth(unionId)
        })
      } else {
        this.retryGetClubAuth(unionId)
      }
    },
    retryGetClubAuth(unionId) {
      // 尝试登录是否登录成功 抖音没有unionId
      if (unionId) {
        $wxpass.login({
          notGetUserInfo: true
        }, ({ status, data }) => {
          if (status === 0) {
            const { openid: openId, bind, isBindMobile, clubAuth, isChina } = data
            let userInfo = {
              openId,
              isChina,
              bind, // 是否绑定CC账号
              isBindMobile, // 是否绑定手机号
              clubAuth // 现在其实无需判断国内外账户，此时有clubAuth就算登录成功
            }
            // 国内已关联手机号的用户，直接执行登录成功操作
            Taro.setStorageSync('ClubAuth', clubAuth)
            this.setLoginInfo({
              userInfo,
              loginStatus: clubAuth ? LOGIN_STATUS.SUCCESS : ''
            })
            this.loginSuccessEmitter(LOGIN_STATUS.SUCCESS)
            clearTimeout(stPassTimeOut)
          }
        })
        return
      }

      this.loginSuccessEmitter(LOGIN_STATUS.OUT)
      
      // 判断ip
      $wxpass.checkIp({}, res => {
        this.setLoginInfo({
          userInfo: {
            isChina: res.isChina
          }
        })
      })
    },
    /** 尝试再次初始化 sdk */
    reInitPassSDK() {
      if (!$wxpass) {
        return false
      }

      if ($wxpass.initialized) {
        return false
      }

      $wxpass.initialize({
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
          this.setLoginInfo({
            loginStatus: LOGIN_STATUS.TIMEOUT
          })
          this.loginSuccessEmitter(LOGIN_STATUS.TIMEOUT)
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
