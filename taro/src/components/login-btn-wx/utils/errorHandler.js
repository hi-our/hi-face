import Taro from '@tarojs/taro'
import errorMap from './const'
import hjError from './error'

let isCodeIn = function(code, params) {
  if (typeof code === 'undefined') return

  params = Array.prototype.slice.call(arguments, 1)

  for (var i = 0, len = params.length; i < len; i++) {
    if (params[i] === code) return true
  }
  return false
}

module.exports = {
  init: function(res, self, initErrorMsg, callback, flow, failure) {
    //微信错误显示

    if (res.statusCode == 200) {
      this.showErrorByCode(
        res.data,
        self,
        initErrorMsg,
        callback,
        flow,
        failure
      )
    } else {
      throw new Error(res.errMsg)
    }
  },

  showErrorByCode: function(
    error,
    self,
    initErrorMsg,
    callback,
    flow,
    failure
  ) {
    let code = error.Code
    let name = errorMap[code]
    let msg = hjError[name] || error.Message
    let field = ''
    let errorMsg = self.state[initErrorMsg]

    // 成功执行回调
    if (isCodeIn(code, 0)) {
      if (callback) callback()
      field = 'initNormal'
    } else {
      typeof failure === 'function' && failure(code, msg)
    }

    // 验证码需要刷新统一处理
    if (
      isCodeIn(
        code,
        1006,
        1101,
        1102,
        1103,
        1104,
        1106,
        1201,
        1202,
        1301,
        1302,
        1303,
        1304,
        1501,
        1502
      )
    ) {
      //刷新验证码

      self.updateCaptcha()
    }

    // 验证码需要刷新统一处理 需要显示
    if (isCodeIn(code, 1004, 1008)) {
      self.setState({
        showCaptcha: true
      })

      self.updateCaptcha()
    }

    if (isCodeIn(code, 1101, 1102, 1103, 1104, 1201, 1202, 1301, 1304)) {
      field = 'username'
    } else if (code === 1004) {
      field = 'captcha'
    } else if (isCodeIn(code, 1302, 1501)) {
      field = 'mobile'
    } else if (isCodeIn(code, 1006, 1008)) {
      field = 'sms'
    } else if (code === 1401) {
      if (flow === 'register') {
        field = 'mobile'
      } else {
        field = 'sms'
      }
    }

    if (field === '' && field !== 'initNormal') {
      Taro.showToast({
        title: msg,
        icon: 'none',
        duration: 1500
      })
    } else {
      if (field === 'captcha') {
        Taro.showToast({
          title: '图片验证码错误，请刷新验证码',
          icon: 'none',
          duration: 1500
        })
      }
      errorMsg[field] = msg
      let obj = {}
      obj[initErrorMsg] = errorMsg
      self.setState(obj)
    }

    self.setState({
      submitDisable: ''
    })
  }
}
