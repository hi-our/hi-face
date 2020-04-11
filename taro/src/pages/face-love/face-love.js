import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import fetch, { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'

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

  chooseImage = async () => {
    const { tempFilePaths } = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],
    })

    let originSrc = tempFilePaths[0]
    console.log('originSrc :', originSrc);

    const fileID = await this.onUploadFile(originSrc)
    console.log('fileID :', fileID);
  }

  onUploadFile = async (tempFilePath, prefix = 'temp') => {
    try {

      let uploadParams = {
        cloudPath: `${prefix}-${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.jpg`, // 随机图片名
        filePath: tempFilePath,
      }
      if (isH5Page) {
        const { fileID } = await Taro.cloud.uploadFile(uploadParams)
        return fileID
      }
      const uploadFile = promisify(Taro.cloud.uploadFile)
      const { fileID } = await uploadFile(uploadParams)
      return fileID

    } catch (error) {
      console.log('error :', error)
      return ''
    }

    // cloud://development-v9y2f.6465-development-v9y2f-1251170943/temp-1586567611269-6357910.jpg

  }

  render() {
    const { pageMainColor } = this.state
    return (
      <View className='face-love-page' style={{ backgroundColor: pageMainColor } }>
        <View className='page-title'>人脸识别</View>
        <View className='image-wrap'>图片区域</View>
        <View className='main-button' onClick={this.chooseImage}>上传</View>
      </View>
    )
  }
}