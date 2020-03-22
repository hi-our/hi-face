import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
import { transformList } from './utils'
import CorePage from 'page';
import './styles.styl'

import * as config from 'config'


const version = config.version

@CorePage
class Self extends Component {
  config = {
    navigationBarTitleText: '个人中心',
  }

  constructor(props) {
    super(props)
    this.state = {
      list: [],
      pageStatus: 'loading',
      errorText: ''
    }
  }

  componentDidMount() {
    Taro.getSetting({
      success: setting => {
        console.log(setting, 'setting')
        if (setting.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          Taro.getUserInfo({
            success: res => {
              console.log('res', res, res.userInfo)
              // 可以将 res 发送给后台解码出 unionId
              this.setState({
                userInfo: res.userInfo
              })

            }
          })
        }
      }
    })
  }

  


  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '个人中心',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/self/self'
    }
  }

  copyToClipboard = (str) => {
    Taro.setClipboardData({
      data: str,
      success() {
        Taro.showToast({
          icon: 'none',
          title: '复制成功'
        })
      },
      fail() {
        console.log('setClipboardData调用失败')
      }
    })

  }

  goOneAvatar = (uuid) => {
    console.log('uuid :', uuid);
    Taro.navigateTo({
      url: `/pages/avatar-poster/avatar-poster?uuid=${uuid}`
    })
  }

  render() {
    const { isLogin } = this.props
    const { list, pageStatus, errorText } = this.state


    return (
      <View className='user-wrap'>
        {
          isLogin
            ? '登录'
            : '未登录'
        }
      </View>
    )
  }
}

export default Self