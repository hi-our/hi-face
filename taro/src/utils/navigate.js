/**
 * 完整跳转策略描述
 * 1. 9 层以下，走正常的微信原生跳转逻辑
 * 2. 当页面栈已经达到 8 层，即将推入第 9 个页面时，
 *   把第 9 个页面设置为 proxy 页面，并在 proxy 页面立即跳转到原本要去的页面，
 *   使得页面栈达到 10 层。
 * 3. 10 层以上，继续推入页面，直接 redirectTo，但将被替换的页面计入 __history。
 *   10 层以后，开始返回上一页，都会先返回 proxy 页面，proxy 页面如果检查到 __history 有值，就 navigateTo
 *   当 __history 为空，就执行 navigateBack，回到第 8 层。
 *
 * 以下使用例子描述
 * - 8层: [1a, 2b, 3c, 4d, 5e, 6f, 7g, 8h]
 * - 继续推入页面 i: [1a, 2b, 3c, 4d, 5e, 6f, 7g, 8h, 9proxy, 10i]
 * - 继续推入页面 j: [1a, 2b, 3c, 4d, 5e, 6f, 7g, 8h, 9proxy, 10j]，__history [i]
 * - 继续推入页面 k: [1a, 2b, 3c, 4d, 5e, 6f, 7g, 8h, 9proxy, 10k]，__history [i, j]
 * ...以此类推
 * - 假设在 k 页面开始后退
 * - 从 k 返回上一页 j:
 *   [1a, 2b, 3c, 4d, 5e, 6f, 7g, 8h, 9proxy], __history [i, j]
 *   会自动到 proxy 页面，到 proxy 后立即 navigateTo
 *   [1a, 2b, 3c, 4d, 5e, 6f, 7g, 8h, 9proxy, 10j]，__history [i]
 * ...以此类推，直到 [1a, 2b, 3c, 4d, 5e, 6f, 7g, 8h, 9proxy, 10i], __history []
 * - 从 i 返回 h
 *  会自动到 proxy 页面，到达后直接在 proxy 调用 navigateBack 即可
 *
 * 注意点
 * 1. 必须使用封装好的 navigate，业务代码中不能直接使用 Taro.navigateTo、Taro.redirectTo 方法
 * 2. 30 层以上，基于性能考虑，直接清除所有页面栈。清除前会上报，用来发现极端场景，优化交互，避免无限跳转。
 */

import Taro from '@tarojs/taro'
import { $log } from './common'

let __history = [] // 本地缓存的超出页面栈限制后的后续页面
let logOverStack = false
const MAX_PAGE_STACK = 10 // 微信页面栈限制为 10 层，我们将 proxy 页面设置在第九层
const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x)
const tabRoutes = ['/pages/queen-king/queen-king', '/pages/self/self']
const proxyRoute = '/pages/proxy/proxy'

function getUrl(url, data) {
  if (typeof url === 'string' && url[0] !== '/') {
    url = `/${url}` // 必须使用绝对路径跳转
  }

  let qs = ''
  if (isObj(data)) {
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        const prefix = qs === '' ? '?' : '&'
        qs += `${prefix}${key}=${data[key]}`
      }
    })
  }
  return `${url}${qs}`
}

export const History = {
  push(navParams) {
    __history.push(navParams)
  },
  pop() {
    return __history.pop()
  },
  size() {
    return __history.length || 0
  },
  clear() {
    __history = []
  },
  reset(history) {
    __history = history
  }
}

export function getPageStackInfo() {
  let pages = getCurrentPages()
  let stackLevel = 0
  let lastPage = ''
  if (pages && pages.length) {
    stackLevel = pages.length
    const lastPageRef = pages[pages.length - 1]
    if (lastPageRef && lastPageRef.route) {
      lastPage = getUrl(lastPageRef.route, lastPageRef.options)
    }
  }

  pages = null // 防止内存泄漏

  return {
    lastPage,
    stackLevel,
  }
}

export function getPageStackLevel() {
  let pages = getCurrentPages()
  const res = (pages && pages.length) || 0
  pages = null // 防止内存泄漏
  return res
}

const hyperNav = ({
  clear,
  redirect,
}) => ({ url, data, success, fail, complete }) => {
  const target = getUrl(url, data)
  const navParams = {
    url: target,
    success,
    fail,
    complete,
  }

  // 直接转到 tab 页，会清掉页面栈
  if (tabRoutes.includes(url)) {
    History.clear()
    Taro.switchTab(navParams)
    return
  }

  // 直接清除页面栈
  if (clear) {
    History.clear()
    Taro.reLaunch(navParams)
    return
  }

  let navAction = redirect ? Taro.redirectTo : Taro.navigateTo
  const { stackLevel, lastPage } = getPageStackInfo()

  // 将第九层设置为 proxy 页面
  if (stackLevel === MAX_PAGE_STACK - 2) {
    History.reset([target])
    Taro.navigateTo({
      ...navParams,
      url: proxyRoute
    })
    return
  }

  // 第十层以后，都 redirectTo 到目标页
  if (stackLevel >= MAX_PAGE_STACK) {
    if (lastPage) {
      History.push(lastPage)
      if (History.size() >= 40 && !logOverStack) {
        logOverStack = true
        $log({
          msg: '页面栈过深，超过 40 级'
        })
      }
    }
    Taro.redirectTo(navParams)
    return
  }

  // 十层以下，普通跳转，走微信机制
  navAction(navParams)
}

/**
 * 统一所有微信跳转 api
 * 1. 自动判断是 navigateTo 还是 switchTab
 * 2. 突破微信 10 层限制
 */
export const navigateTo = hyperNav({})
export const redirectTo = hyperNav({ redirect: true })
export const reLaunch = hyperNav({ clear: true })
export const switchTab = navigateTo
