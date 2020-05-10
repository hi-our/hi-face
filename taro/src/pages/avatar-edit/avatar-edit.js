import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { STATUS_BAR_HEIGHT, SAVE_IMAGE_WIDTH } from './utils'
import ImageChoose from './components/image-choose'

import './styles.styl'


// @CorePage
class AvatarEdit extends Component {
  config = {
    navigationBarTitleText: '头像编辑',
    navigationStyle: 'custom',
    disableScroll: true
  }

  render() {
    return (
      <View className='avatar-edit-page' style={{ paddingTop: STATUS_BAR_HEIGHT + 'px' }}>
        <View className='page-title'>人像魅力</View>
        <Canvas className='canvas-shape' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_WIDTH + 'px' }} canvasId='canvasShape' ref={c => this.canvasShapeRef = c} />
        <View className='main-wrap'>
          <ImageChoose />
        </View>
      </View>
    )
  }
}