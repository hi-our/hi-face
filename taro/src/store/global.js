import Taro from '@tarojs/cli'
import mirror from 'mirror'
import { cloudCallFunction } from 'utils/fetch'
import * as config from 'config'

export const modelName = 'global'

let networkInfo = {
  isConnected: true,
  networkType: 'wifi'
}

export const getNetworkInfo = () => networkInfo


/**
 * 全局状态
 */
const globalActions = mirror.model({
  name: modelName,
  initialState: {
    networkInfo,
    forCheck: undefined, // 过审开关，开启时 app 展示用于给微信官方审核员的数据
    themeList: []
  },
  reducers: {
    setNetworkInfo(state, payload) {
      return {
        ...state,
        ...payload
      }
    }
  },
  effects: {
    // 查询小程序提交审核版本时的开关是否开启
    async getForCheckStatus() {
      const { forCheck } = this.getState()
      if (typeof forCheck !== 'boolean') {
        try {
          const { version } = await cloudCallFunction({
            name: 'hiface-api',
            data: {
              $url: 'config/get',
              configName: 'for-check',
            }
          })
          this.setState({
            forCheck: version === config.version
          })
        } catch(error) {
          console.log('forCheck', error)
        }
      }
    },
    // 获取主题列表
    async getThemeList() {
      try {
        const { items } = await cloudCallFunction({
          name: 'hiface-api',
          data: {
            $url: 'theme/list',
            pageSize: 50,
          }
        })
        this.setState({
          themeList: items
        })
      } catch (error) {
        console.log('getThemeList error', error)
      }
    },
  }
})

Taro.getNetworkType({
  success: (res) => {
    networkInfo = {
      isConnected: res.networkType !== 'none',
      networkType: res.networkType
    }
    console.log('网络情况', networkInfo)
    globalActions.setNetworkInfo({
      networkInfo
    })
  }
})

Taro.onNetworkStatusChange(function (res) {
  console.log('网络状态变化', res)
  networkInfo = res
  globalActions.setNetworkInfo({
    networkInfo
  })
})


export default globalActions