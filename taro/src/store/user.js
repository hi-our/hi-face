import Taro from '@tarojs/taro'
import mirror from 'mirror'
import * as config from 'config'
import { LOGIN_STATUS } from 'constants/status'
import EventEmitter from 'utils/EventEmitter'
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
  effects: {
    login() {
      return cloudCallFunction({
        name: 'login',

      }).then(res => {
        console.log('res :', res);
      })

    }
  }
})
export default userActions