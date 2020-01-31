const testImage = 'https://n1image.hjfile.cn/res7/2020/01/31/8ab8ff439233f3beae97a06c2b2bdec2.jpeg'

import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import ImageCropper from 'components/image-cropper-taro'
import fetch from 'utils/fetch'
import { apiAnalyzeFace } from 'constants/apis'
import { getSystemInfo } from 'utils/common'
import { getHatInfo, getBase64Main } from 'utils/face-utils'
import { drawing } from 'utils/canvas-drawing'

import { NOT_FACE, ONE_FACE } from 'constants/image-test'

const imageData = ONE_FACE

import './styles.styl'

const { windowWidth } = getSystemInfo()
const CANVAS_SIZE = '300px'

// @CorePage
class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
    // navigationStyle: 'custom'
    'image-cropper': '../../components/image-cropper/image-cropper' // 书写第三方组件的相对路径
  }

  componentDidMount() {
    // this.testFetch()
  }
  
  render() {
    return (
      <View>
        <ImageCropper
          limit_move="{{true}}" disable_rotate="{{true}}" width="{{width}}" height="{{height}}" imgSrc="{{src}}" bindload="cropperload" bindimageload="loadimage" bindtapcut="clickcut"
        />
      </View>
    )
  }
}