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
    disableScroll: true
  }

  constructor(props) {
    super(props)
    this.state = {
      list: [],
      pageStatus: 'loading',
      errorText: ''
    }
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

  goMyAvatars = () => {
    Taro.navigateTo({
      url: '/pages/my-avatars/my-avatars'
    })
  }
  goThanks = () => {
    Taro.navigateTo({
      url: '/pages/thanks/thanks'
    })
  }

  render() {
    const { isLogin, userInfo } = this.props

    const { wechatInfo = { }, avatar } = userInfo
    const { avatarUrl, nickName, country = '', province = '', city = '' } = wechatInfo


    return (
      <View className='self-page'>
        <View className='user-wrap'>
          {
            isLogin
              ? (
                <Block>
                  <View className='avatar'>
                    <Image src={avatarUrl || avatar}></Image>
                  </View>
                  <View className='user-main'>
                    <View className='nick-name'>{nickName}</View>
                    <View className='address-text'>{country} {province} {city}</View>
                  </View>
                </Block>
              )
              : (
                <Block>
                  <View className='avatar'>
                    
                  </View>
                  <View className='user-main'>
                    <View className='nick-name'>未登录</View>
                    {/* <View className='address-text'></View> */}
                  </View>
                </Block>
              )
          }
        </View>
        <View className='list-wrap'>
          <View className='item' onClick={this.goMyAvatars}>
            <Image className='item-image' src='https://n1image.hjfile.cn/res7/2020/03/22/7b172802b0cbadee5708c8c03a9fc48c.png' />
            头像列表
            <View className='item-icon'></View>
          </View>
          <View className='item' onClick={this.goThanks}>
            <Image className='item-image'  src='https://n1image.hjfile.cn/res7/2020/03/22/4573f9e2d8b60d5a02cffb6de351ee6f.png' />
            致谢
            <View className='item-icon'></View>
          </View>
        </View>
        <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
      </View>
    )
  }
}

export default Self