/**
 * 全局缓存文件
 * @type {Object}
 */
export const Store = {
  __events__: new Map(), // 时间广播
  requestList: {}, // 请求缓存，防止重复请求
}

const Events = Store['__events__']

/**
 * 基础事件订阅
 */
export default {
  events() {
    return Store['__events__']
  },
  on(key, fn) {
    let exits = Events.get(key)
    if (exits) {
      exits.push(fn)
    } else {
      Events.set(key, [fn])
    }
  },
  off(key, fn) {
    const _events = Events.get(key)
    if (!_events) return
    if (fn && _events.length) {
      let tmplArr = []
      for (let i = _events.length - 1; i >= 0; i--) {
        if (_events[i] !== fn) {
          tmplArr.push(_events[i])
        }
      }
      tmplArr.length ? Events.set(key, tmplArr) : Events.delete(key)
      return
    }
    Events.delete(key)
  },

  emit(key, ...args) {
    const _events = Events.get(key)
    if (_events) {
      _events.forEach(func => func.apply(null, args))
    }
  },

  /**
   * 缓存数据
   * @param      {[type]} key                      [description]
   * @param      {[type]} val                      [description]
   * @return     {[type]}                          [description]
   * @author  johnnyjiang
   * @email               johnnyjiang813@gmail.com
   * @createTime          2018-06-26T21:20:02+0800
   */
  put(key, val) {
    if (Reflect.has(Store, key)) {
      Store[key].push(val)
      return Store[key].length
    }
    Reflect.set(Store, key, [val])
    return 1
  },

  /**
   * 从缓存中取数据，默认取出后立即清除缓存
   * @return     {[type]}                           [description]
   * @author  johnnyjiang
   * @email                johnnyjiang813@gmail.com
   * @createTime           2018-06-26T21:19:39+0800
   */
  take(key, clear = true) {
    const val = Store[key] || null
    if (val && key !== '$app' && clear) {
      Reflect.deleteProperty(Store, key)
    }
    return val
  },
}
