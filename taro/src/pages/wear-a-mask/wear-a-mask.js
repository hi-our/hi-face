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
    usingComponents: {
      'image-cropper': '../../components/image-cropper/image-cropper' // 书写第三方组件的相对路径
    }
    // navigationStyle: 'custom'
  }

  componentDidMount() {
    // this.testFetch()
    //获取到image-cropper实例
    this.cropper = this.$scope.selectComponent("#image-cropper");
    //开始裁剪
    this.setState({
      src: "https://n1image.hjfile.cn/res7/2020/01/31/85a57f8e140431329c0439a00e13c1a0.jpeg",
    });
    Taro.showLoading({
      title: '加载中'
    })
  }

  cropperload = (e) => {
    console.log("cropper初始化完成");
  }
  loadimage = (e) => {
    console.log("图片加载完成", e.detail);
    Taro.hideLoading();
    //重置图片角度、缩放、位置
    console.log('this.cropper :', this.cropper);
    this.cropper.imgReset();
  }
  clickcut = (e) => {
    console.log('clickcut', e.detail);
    //点击裁剪框阅览图片
    Taro.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  }

  
  render() {
    return (
      <View>
        2
        <image-cropper
          id='image-cropper'
          limit_move="{{true}}" disable_rotate="{{true}}" width="{{width}}" height="{{height}}" imgSrc="{{src}}" onLoad={this.cropperload} onImageload={this.loadimage} onTapcut={this.clickcut}
        />
      </View>
    )
  }
}