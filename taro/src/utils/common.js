import Taro from '@tarojs/taro'

let _systemInfo = null
let _isXPhoneArea = null

/**
 * 获取系统信息
 */
export const getSystemInfo = () => {
  if (_systemInfo === null) {
    _systemInfo = Taro.getSystemInfoSync()
  }
  return _systemInfo
}

/**
 * 判断是否是 IphoneX、iPhone 11、iPhone 12 系列
 */
export const isIphoneSafeArea = () => {
  if (_isXPhoneArea === null) {
    const { model = '', brand = '', statusBarHeight = 0 } = getSystemInfo()
    _isXPhoneArea = statusBarHeight === 44 && (model.includes('iPhone') || brand.includes('Apple') || brand.includes('iPhone') )
  }
  return _isXPhoneArea
}

/**
 * 将 API 进行 Promise 化
 */
export const promisify = (api) => {
  return (options, ...params) => {
    return new Promise((resolve, reject) => {
      api(Object.assign({}, options, { success: resolve, fail: reject }), ...params);
    });
  }
}

/**
 * 显示 Web 端提示
 */
export function h5PageModalTips() {
  Taro.showModal({
    showCancel: false,
    title: '提示',
    content: '本网站为“Hi头像”的Web版本，其功能只适用于智能触屏手机使用。微信搜一搜“Hi头像”，可以体验完整功能。',
  })
}
