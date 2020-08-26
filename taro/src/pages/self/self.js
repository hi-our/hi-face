import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import CorePage from 'page'
import CustomTabBar from 'components/custom-tab-bar'
import './styles.styl'

import * as config from 'config'


const version = config.version

@CorePage
class Self extends Component {
  config = {
    navigationBarTitleText: '个人中心',
    disableScroll: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      tabBarIndex: -1
    }
  }

  componentDidShow() {
    this.setState({
      tabBarIndex: 2
    })
  }
  componentDidHide() {
    this.setState({
      tabBarIndex: -1
    })
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'

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
    const { tabBarIndex } = this.state
    const { isLogin, userInfo } = this.props

    const { wechatInfo = { }, avatar } = userInfo
    const { avatarUrl, nickName, country = '', province = '', city = '' } = wechatInfo


    return (
      <View className='self-page'>
        <View className='main-wrap'>
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
              <Image className='item-image' src='https://image-hosting.xiaoxili.com/img/20200812133940.png' />
              头像列表
              <View className='item-icon'></View>
            </View>
            <View className='item' onClick={this.goThanks}>
              <Image className='item-image' src='https://image-hosting.xiaoxili.com/img/20200812133954.png' />
              致谢
              <View className='item-icon'></View>
            </View>
          </View>

        </View>
        <CustomTabBar selected={tabBarIndex} />
      </View>
    )
  }
}

export default Self