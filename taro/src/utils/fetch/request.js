import Taro from '@tarojs/taro'
import * as config from 'config'
import { getSystemInfo } from '../common'
import { NETWORK_ERROR_CODE } from 'constants/status'
import { apiAdapter } from './utils'


const request = (method = 'GET') => ({ url, data, cb }) => {
  return apiAdapter(url, data).then(({ api, params }) => {
    // let clubAuth = Taro.getStorageSync('ClubAuth') || ''

    // const { tokenKey, wxName, version: wxversion } = config
    // const appInfo = getSystemInfo()


    return Taro.request({
      method,
      url: api,
      data: params,
      header: {
        'Content-Type': 'application/json',
        // Cookie: `${tokenKey}=${clubAuth}`,
      },
    })
  }).then(res => {
    if (res.statusCode === 200) {
      let result = res.data
      if (result.status === 0) {
        const finalResult = result.data || {}
        if (Array.isArray(finalResult)) return finalResult || [] // 兼容返回data是数组的情况
        if (Object.keys(finalResult).length === 0) return finalResult || {} // 某些接口判断返回data字段是否是空对象的逻辑，所以这里针对空对象不增加__serverTime__字段
        
        let { time: __serverTime__ } = result
        return { ...finalResult, __serverTime__ } || {}
      } else {
        throw result
      }
    } else {
      throw res.data
    }
  }).catch(error => {
    const { errMsg = '', status } = error

    if (errMsg.includes('request:fail') ) {
      throw {
        ...error,
        status: NETWORK_ERROR_CODE,
        message: `请求${errMsg.includes('timeout') ? '超时' : '失败'}，请稍后重试`
      }
    }

    if (status === 404) {
      throw {
        ...error,
        message: '接口地址不存在'
      }
    }

    throw error

  })

  // TODO finally找不到
  // .finally(() => {
  //   if (cb && typeof cb === 'function') {
  //     cb()
  //   }
  // })
}

export default {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE'),
}
