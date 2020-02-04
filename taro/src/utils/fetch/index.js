import request from './request'
import Taro from '@tarojs/taro'


export const cloudCallFunction = ({ name, data = {}, config = {} }) => {
  return new Promise((resolve, reject) => {
    Taro.cloud.callFunction({
      name,
      data,
      config
    }).then(callRes => {
      const { errMsg = '', result } = callRes
      if (errMsg.includes('ok')) {
        let apiResult = result
        if (apiResult.status === 0) {
          const finalResult = apiResult.data || {}
          if (Array.isArray(finalResult)) resolve(finalResult || []) // 兼容返回data是数组的情况
          if (Object.keys(finalResult).length === 0) resolve(finalResult || {})  // 某些接口判断返回data字段是否是空对象的逻辑，所以这里针对空对象不增加__serverTime__字段
  
          let { time: __serverTime__ } = apiResult
          resolve({ ...finalResult, __serverTime__ } || {})
        } else {
          reject(apiResult)
        }
        
      } else {
        reject(result)
      }
    }).catch(error => {
      // console.log('error :', error);
      
      reject(error)
    })

  })
}

export default ({ type = 'get', url, data = {}, cb }) => {
  if (!Reflect.has(request, type)) {
    console.error(`fetch: type ${type} is not a request method. and please use lower case.`)
  }

  const func = Reflect.get(request, type)
  return func({
    url,
    data,
    cb,
  })
}
