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
    'avatar-edit': {}
  },
  reducers: {

  },
  effects: {
    // 查询小程序提交审核版本时的开关是否开启
    async getForCheckStatus() {
      const { forCheck } = this.getState()
      console.log('getForCheckStatus forCheck :>> ', forCheck);
      console.log('2 :>> ', 2);
      if (typeof forCheck !== 'boolean') {
        console.log('1 :>> ', 1);
        try {
          const { version } = await cloudCallFunction({
            name: 'collection_get_configs',
            data: {
              configName: 'for-check',
            }
          })
          this.setState({
            forCheck: version === config.version
          })
        } catch(err) {
          debugger
          console.log('forCheck', err)
        }
      }
    },
    // /**
    //  * 上报 formIds
    //  */
    // async submitFormIds() {
    //   // TODO: 不要使用 eventbus 来做 channel
    //   const formIds = EventEmitter.take('formIds')
    //   if (!formIds || !formIds.length) return
      
    //   const { userInfo } = await userActions.getLoginInfo() || {}
    //   const { openId } = userInfo

    //   fetch({
    //     url: postFormIds,
    //     type: 'post',
    //     data: {
    //       appId: config.appId,
    //       formIds,
    //       openId,
    //       type: 0
    //     }
    //   })
    // }
  }
})