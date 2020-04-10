import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import fetch, { cloudCallFunction } from 'utils/fetch'

// 引入代码
// import { TaroCanvasDrawer,  } from 'components/taro-plugin-canvas';

const isH5Page = process.env.TARO_ENV === 'h5'

import './styles.styl';


// @CorePage
class FaceLove extends Component {
  config = {
    navigationBarTitleText: '人像魅力',
    navigationStyle: 'custom',
    disableScroll: true
  }

  constructor(props) {
    super(props)
    this.state = {
      pageMainColor: 'yellow'
    }
  }

  render() {
    const { pageMainColor } = this.state
    return (
      <View className='face-love-page' style={{ backgroundColor: pageMainColor } }>
        <View className='page-title'>人脸识别</View>
        <View className='image-wrap'>图片区域</View>
        <View className='main-button'>上传</View>
      </View>
    )
  }
}