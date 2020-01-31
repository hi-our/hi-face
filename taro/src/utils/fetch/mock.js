'use strict'

import mockRules from '@/mock-rules'
import { urlToLocation } from './utils'

const MOCK_HOST = 'http://face.xuexitrip.com:8768'

function getMatched(api) {
  let url = urlToLocation(api)
  for (const key in mockRules) {
    if (key !== 'config') { // 排除非接口列表的字段
      let urls = mockRules[key] || []
      let matched = urls.length > 0 && urls.findIndex((item) => {
        let reg = new RegExp(item.replace('*', '(.*)'))
        return reg.test(url.pathname)
      })

      if (matched >= 0) {
        url.matchKey = key
        return url
      }
    }
  }
  return false
}

export function apiMatcher(api) {
  return !!getMatched(api).matchKey
}

export function mocker(api, params) {
  let { pathname = '', search = '' } = getMatched(api)
  return {
    api: `${MOCK_HOST}${pathname}${search}`,
    params: {...params, ...mockRules.config.query}
  }
}