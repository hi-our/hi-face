import Taro from '@tarojs/cli'
import mirror from 'mirror'
import { cloudCallFunction } from 'utils/fetch'
import * as config from 'config'

export const modelName = 'global'

/**
 * 全局状态
 */
export default mirror.model({
  name: modelName,
  initialState: {
    forCheck: undefined, // 过审开关，开启时 app 展示用于给微信官方审核员的数据
  },
  effects: {
    // 查询小程序提交审核版本时的开关是否开启
    async getForCheckStatus() {
      const { forCheck } = this.getState()
      if (typeof forCheck !== 'boolean') {
        try {
          const { version } = await cloudCallFunction({
            name: 'api',
            data: {
              $url: 'config/get',
              configName: 'for-check',
            }
          })
          this.setState({
            forCheck: version === config.version
          })
        } catch(err) {
          console.log('forCheck', err)
        }
      }
    },
  }
})