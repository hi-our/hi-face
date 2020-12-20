import Taro from '@tarojs/taro'

export const isH5Page = Taro.getEnv() === 'WEB'

/**
 * 判断浏览器是否兼容 Webp 格式图片
 */
let hasWebP = false
function checkWebp() {
  var img = new Image()
  img.onload = function () {
    hasWebP = !!(img.height > 0 && img.width > 0)
  }
  img.onerror = function () {
    hasWebP = false
  }
  img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
}

// 小程序上无需判断，H5需要判断，
if (isH5Page) {
  checkWebp()
} else {
  hasWebP == true
}

// 这个方法，不兼容Safari浏览器，所以改用了加载webp图片的方式
// Safari 14支持webp格式，但dataUrl中还是 image/png
function checkSupportWebP() {
  const ele = document.createElement('canvas')
  if (ele && typeof ele.toDataURL === 'function') {
    const dataUrl = ele.toDataURL('image/webp') || ''
    return dataUrl.indexOf('data:image/webp') === 0
  }
  return false
}

// // 判断支持 WebP 格式图片
// const isSupportWebP = isH5Page ? checkSupportWebP() : true

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
/* 
情景一：safeArea 安全区的top 大于0
情景二：在ios 13中获取 model 包含苹果字眼，并且状态栏不小于 44 的情况
*/
export const isIphoneSafeArea = () => {
  if (_isXPhoneArea === null) {
    const { model = '', brand = '', statusBarHeight = 0, safeArea = {} } = getSystemInfo()
    _isXPhoneArea = safeArea.top > 0 || (statusBarHeight >= 44 && (model.includes('iPhone') || brand.includes('Apple') || brand.includes('iPhone')))
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

/**
 * 图片缩略
 * @format  Format 可为：jpg，bmp，gif，png，webp
 * @mode  1 保持图片的宽高比 2  按照图片裁切
 * 文档：https://cloud.tencent.com/document/product/460/6929
 */
export const imageThumb = (src, width, height, format = 'webp', mode = 1, ) => {
  if (!src) return ''
  if (src.includes('cloud:')) return src
  
  let pathn = src.trim().replace(/^http(s)?:\/\//ig, '')

  pathn = pathn.split('/')
  let domain = pathn[0]
  if (!domain) {
    return src
  }
  let returnUrl = src

  if (width || height) {
    if (/imageView2/ig.test(src)) {
      returnUrl =  src.replace(/(?:\?imageView2.*)$/ig, '').replace(/(\.[a-z_]+)$/ig, `$1?imageView2/${c}/w/${width || 0}/h/${height || 0}`)
    } else {
      returnUrl = src.replace(/(\.[a-z_]+)$/ig, `$1?imageView2/${mode}/w/${width || 0}/h/${height || 0}`)
    }
    
    if (format === 'webp' && hasWebP) {
      
      returnUrl += '/format/webp/ignore-error/1'
    }
  }

  return returnUrl
}
