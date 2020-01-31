import Taro from '@tarojs/cli'
import mirror from 'mirror'
import EventEmitter from 'utils/event-emitter'
import fetch from 'utils/fetch'
import { postFormIds, getSwitchForCheck } from 'constants/apis'
import * as config from 'config'
import userActions from './user'

export const modelName = 'global'

/**
 * 全局状态
 */
export default mirror.model({
  name: modelName,
  initialState: {
    forCheck: undefined, // 过审开关，开启时 app 展示用于给微信官方审核员的数据
  },
  reducers: {

  },
  effects: {
    // 查询小程序提交审核版本时的开关是否开启
    async getForCheckStatus() {
      const { forCheck } = this.getState()
      if (typeof forCheck !== 'boolean') {
        try {
          const { switchOn } = await fetch({
            url: getSwitchForCheck
          })
          this.setState({
            forCheck: !!switchOn
          })
        } catch(err) {
          console.log('forCheck', err)
        }
      }
    },
    /**
     * 上报 formIds
     */
    async submitFormIds() {
      // TODO: 不要使用 eventbus 来做 channel
      const formIds = EventEmitter.take('formIds')
      if (!formIds || !formIds.length) return
      
      const { userInfo } = await userActions.getLoginInfo() || {}
      const { openId } = userInfo

      fetch({
        url: postFormIds,
        type: 'post',
        data: {
          appId: config.appId,
          formIds,
          openId,
          type: 0
        }
      })
    }
  }
})