
/**
 * 将 string url 转换成类似 location 的对象
 * @param {string} href
 * @returns 类 location 对象
 */
export function urlToLocation(href) {
  if (typeof href !== 'string') {
    href = ''
  }

  const match = href.match(
    /^(?:(https?\:)\/\/)?(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
  )
  // '^(https?:)//', // protocol
  // '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
  // '(/{0,1}[^?#]*)', // pathname
  // '(\\?[^#]*|)', // search
  // '(#.*|)$' // hash
  return (
    match && {
      href,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7]
    }
  )
}

/**
 * 接口匹配
 * @param      {[type]} api                      [description]
 * @param      {[type]} params                   [description]
 * @return     {[type]}                          [description]
 */
export const apiAdapter = (api, params) => {
  return new Promise((resolve, reject) => {
    if (!api) {
      reject(new URIError('API is empty!'))
    }
    // 微信小程序不支持反向寻址(坑) /(?<=\{)([^\}])+(?=\})/ig
    let restReg = /{([^}])+}/ig
    // api处理
    api = api.replace(restReg, matchkey => {
      let keyName = matchkey.slice(1, matchkey.length - 1)
      if (params.hasOwnProperty(keyName)) {
        let tempValue = params[keyName]
        delete params[keyName]
        return tempValue
      }
      return matchkey
    })


    if (process.env.MOCK === 'true' && process.env.NODE_ENV === 'development') {
      const { apiMatcher, mocker } = require('./mock')

      if (apiMatcher(api)) {
        let mockResult = mocker(api, params)
        api = mockResult.api
        params = mockResult.params
      }
    }

    // check 是否还有参数未转化
    if (restReg.test(api)) {
      reject(new SyntaxError(`${api.match(restReg).join(',')}参数必填`))
    }
    resolve({ api, params })
  })
}