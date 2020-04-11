import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import fetch, { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'
import { PAGE_DPR_RATIO } from './utils';

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
      pageMainColor: 'yellow',
      faceFileID: '',
      shapeList: []
    }
  }

  chooseImage = async () => {
    const { tempFilePaths } = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],
    })

    let originSrc = tempFilePaths[0]
    
    Taro.showLoading({
      title: '识别中...'
    })

    try {
      const fileID = await this.onUploadFile(originSrc)
  
      const { faceFileID, FaceInfos = [] } = await cloudCallFunction({
        name: 'face-recognition',
        data: {
          fileID
        }
      })
      Taro.hideLoading()
      let shapeList = []
      if (FaceInfos.length > 0) {
        shapeList = FaceInfos.map((item, itemIndex) => {
          const { X, Y, Height, Width } = item
          return {
            itemIndex,
            left: X * PAGE_DPR_RATIO,
            top: Y * PAGE_DPR_RATIO,
            width: Width * PAGE_DPR_RATIO,
            height: Height * PAGE_DPR_RATIO,
          }
        })
      }

      // shapeList

      this.setState({
        faceFileID: 'cloud://' + faceFileID,
        shapeList
      })


      console.log('res :', faceFileID);
      
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({
        icon: 'none',
        title: error.message
      })
      console.log('error :', error);
    }
  }

  onUploadFile = async (tempFilePath, prefix = 'temp') => {
    try {

      let uploadParams = {
        cloudPath: `${prefix}/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.jpg`, // 随机图片名
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

  }

  render() {
    const { pageMainColor, faceFileID, shapeList } = this.state
    return (
      <View className='face-love-page' style={{ backgroundColor: pageMainColor } }>
        <View className='page-title'>人脸识别</View>
        <View className='image-wrap'>
          {
            !!faceFileID
              ? (
                <View className='shape-wrap'>
                  <Image
                    src={faceFileID}
                    mode='widthFix'
                    className='image-selected'
                  />
                  {
                    shapeList.map((shape) => {
                      const { left, top, width, height } = shape
                      return <View key={shape.index} className='shape-item' style={{ left: left+ 'px', top: top + 'px', width: width + 'px', height: height + 'px' }}></View>
                    })
                  }
                </View>
              )
              : <View>图片区域</View>
          }
        </View>
        <View className='main-button' onClick={this.chooseImage}>上传</View>
      </View>
    )
  }
}