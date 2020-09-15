import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Canvas } from '@tarojs/components'
import { h5PageModalTips, getSystemInfo } from 'utils/common'


const { statusBarHeight } = getSystemInfo()

import './styles.styl'


class AboutPage extends Component {
  config = {
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '关于我们 - Hi头像',
    navigationStyle: 'custom',
    disableScroll: true,
  }

  constructor(props) {
    super(props)
    const showBackToIndexBtn = Taro.getStorageSync('showBackToIndexBtn')

    this.state = {
      showBackToIndexBtn,
    }
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/img/20200908/20f5ceab078c93d0901ea0ab0aac8b27-1231fe.jpg'

    return {
      title: '关于我们 - Hi头像',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/about/about'
    }
  }

  goBack = () => {
    Taro.navigateBack()
  }

  goHome = () => {
    Taro.switchTab({
      url: '/pages/avatar-edit/avatar-edit'
    })
  }

 
  render() {
    const { showBackToIndexBtn } = this.state
    return (
      <View className='about-page'>
        {
          showBackToIndexBtn
            ? <View className='page-home' style={{ marginTop: statusBarHeight + 'px' }} onClick={this.goHome}></View>
            : <View className='page-back' style={{ marginTop: statusBarHeight + 'px' }} onClick={this.goBack}></View>
        }
        <View className='section section-1'>
          <View className='section-title'>设计师</View>
          <View className='section-desc'>不二雪</View>
          <View className='section-desc'>微信号：buerxue22</View>
          <Image className='section-image' src='https://image-hosting.xiaoxili.com/img/img/20200915/4fe7c83e8688c8ccdcc518462ef8064b-932bbc.png'></Image>
        </View>
        <View className='section section-2'>
          <Image className='section-image' src='https://image-hosting.xiaoxili.com/img/img/20200915/bea9cd0aa66d0269f796c340ca1958f0-436243.png'></Image>
          <View className='section-title'>工程师</View>
          <View className='section-desc'>小溪里</View>
          <View className='section-desc'>微信号：xiaoxili22</View>
        </View>
      </View>
    )
  }
}

export default AboutPage