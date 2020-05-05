import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas, Block, ScrollView } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import fetch, { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'
import { PAGE_DPR_RATIO, GENDER_STATUS, EXPRESS_MOOD, HAVE_STATUS, STATUS_BAR_HEIGHT, getFaceShapes, getFaceCutList } from './utils';

// 引入代码
// import { TaroCanvasDrawer,  } from 'components/taro-plugin-canvas';

const isH5Page = process.env.TARO_ENV === 'h5'

import './styles.styl';


// @CorePage
class FaceLove extends Component {
  config = {
    navigationBarTitleText: '人像魅力',
    navigationStyle: 'custom',
    disableScroll: true,
    navigationBarTextStyle: 'black'
  }

  constructor(props) {
    super(props)
    this.state = {
      pageMainColor: '',
      faceImageUrl: '',
      shapeList: [],
      labelList: [],
      showCutList: []
    }
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/04/26/2041af2867f22e62f8fce32b29cd1fb0.png'

    return {
      title: '人像魅力',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/detect-face/detect-face'
    }
  }

  chooseImage = async () => {
    const { cancel } = await Taro.showModal({
      title: '提示',
      content: '图片会上传到云端，请确定？',
      
    })
    if (cancel) {
      console.log('用户点击取消')
      return
    }
    const { tempFilePaths } = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],
    })

    Taro.showLoading({
      title: '识别中...'
    })

    let fileID = await this.onUploadFile(tempFilePaths[0])

    let reqList = [
      cloudCallFunction({
        name: 'detect-face',
        data: {
          fileID
        }
      }),
      cloudCallFunction({
        name: 'get-main-color',
        data: {
          fileID
        }
      }),
      cloudCallFunction({
        name: 'detect-image-label',
        data: {
          fileID
        }
      }),
    ]

    Promise.all(reqList).then(results => {
      Taro.hideLoading()

      const { faceImageUrl, FaceInfos = [] } = results[0]
      const { mainColor } = results[1]
      const { list: labelList } = results[2]

      this.setState({
        pageMainColor: mainColor,
        labelList,
        faceImageUrl,
        currentShapeIndex: 0,
        shapeList: getFaceShapes(FaceInfos),
        showCutList: getFaceCutList(FaceInfos, faceImageUrl),
      })

    }).catch(error => {
      Taro.hideLoading()
      const { message, errMsg } = error || {}

      Taro.showToast({
        icon: 'none',
        title: message || errMsg || '识别出错'
      })
    })
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

  onChooseShape = (shapeIndex) => {
    this.setState({
      currentShapeIndex: this.state.currentShapeIndex === shapeIndex ? -1 : shapeIndex
    })
  }

  render() {
    const { pageMainColor, faceImageUrl, shapeList, currentShapeIndex, labelList, showCutList } = this.state
    let tips = '上传带人脸的正面照'
    if (shapeList.length) {
      tips = currentShapeIndex >= 0 ? '点击红色人脸框，可隐藏人脸魅力值' : '点击人脸框，可以显示人脸魅力值'
    }
    return (
      <View className='detect-face-page' style={{ backgroundColor: pageMainColor, paddingTop: STATUS_BAR_HEIGHT + 'px' }}>
        <View className='page-title'>人像魅力</View>
        <View className='label-list'>
          {
            labelList.map((item => {
              return (
                <View className='label-item' key={item.name}>{item.name}</View>
              )
            }))
          }
        </View>
        <View className='image-wrap'>
          {
            !!faceImageUrl
              ? (
                <View className='shape-wrap'>
                  <Image
                    src={faceImageUrl}
                    mode='widthFix'
                    className='image-selected'
                  />
                  {
                    shapeList.map((shape) => {
                      const { shapeIndex, left, top, width, height, age, expressionStr, beauty, glassStr, hatStr, maskStr,
                      } = shape

                      let isActive = currentShapeIndex === shapeIndex
                      return (
                        <View key={shapeIndex} className={`shape-item ${isActive ? 'shape-item-active' : ''}`} style={{ left: left+ 'rpx', top: top + 'rpx', width: width + 'rpx', height: height + 'rpx' }}>
                          <View className='shape-area' onClick={this.onChooseShape.bind(this, shapeIndex)}>
                            <View className="face-line left-top"></View>
                            <View className="face-line right-top"></View>
                            <View className="face-line left-bottom"></View>
                            <View className="face-line right-bottom"></View>
                          </View>
                          {isActive && (
                            <View className={`shape-desc ${left + width + 250 > 600 ? 'in-left' : 'in-right'}`}>
                              <View>年龄: {age}</View>
                              <View>表情: {expressionStr}</View>
                              <View>魅力: {beauty}</View>
                              <View>眼镜: {glassStr}</View>
                              <View>帽子: {hatStr}</View>
                              <View>口罩: {maskStr}</View>
                            </View>

                          )}
                        </View>
                      )
                    })
                  }
                </View>
              )
              : <View className='to-choose' onClick={this.chooseImage}></View>
          }
          <View className='image-tips'>{tips}</View>
          {
            shapeList.length > 0 && (
              <ScrollView scrollX className='cut-wrap'>
                <Image src={faceImageUrl}
                  mode='aspectFit'
                  onClick={this.onChooseShape.bind(this, -1)}
                  className={`cut-item ${currentShapeIndex === -1 ? 'cut-item-active' : ''}`}
                />
                {
                  showCutList.map(item => {
                    const { fileID, shapeIndex, cutFileUrl } = item
                    return (
                      <Image
                        key={fileID}
                        src={cutFileUrl}
                        onClick={this.onChooseShape.bind(this, shapeIndex)}
                        mode='aspectFit' className={`cut-item ${currentShapeIndex === shapeIndex ? 'cut-item-active' : ''}`}
                      />
                    )
                  })
                }
              </ScrollView>
            )
          }
        </View>
        
        <View className='main-button' onClick={this.chooseImage}>上传</View>
      </View>
    )
  }
}