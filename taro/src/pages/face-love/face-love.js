import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import fetch, { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'
import { PAGE_DPR_RATIO, GENDER_STATUS, EXPRESS_MOOD, HAVE_STATUS } from './utils';

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
      pageMainColor: '',
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
        shapeList = FaceInfos.map((item, shapeIndex) => {
          const { X, Y, Height, Width, FaceAttributesInfo = {} } = item
          const { Gender, Age, Expression, Beauty, Glass, Hat, Mask } = FaceAttributesInfo

          return {
            shapeIndex,
            left: X * PAGE_DPR_RATIO,
            top: Y * PAGE_DPR_RATIO,
            width: Width * PAGE_DPR_RATIO,
            height: Height * PAGE_DPR_RATIO,
            age: Age,
            genderStr: GENDER_STATUS[Gender],
            expressionStr: EXPRESS_MOOD[parseInt(Expression / 10, 10)],
            beauty: Beauty,
            glassStr: HAVE_STATUS[Number(Glass)],
            hatStr: HAVE_STATUS[Number(Hat)],
            maskStr: HAVE_STATUS[Number(Mask)],
          }
        })
      }

      this.setState({
        faceFileID: 'cloud://' + faceFileID,
        currentShapeIndex: FaceInfos.length > 1 ? -1 : 0,
        shapeList
      }, () => {
          if (shapeList.length > 1) {
            Taro.showToast({
              icon: 'none',
              title: '绿框可点击'
            })
          }
      })

      const { mainColor } = await cloudCallFunction({
        name: 'get-main-color',
        data: {
          fileID
        }
      })

      this.setState({
        pageMainColor: mainColor
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

  onChooseShape = (shapeIndex) => {
    this.setState({
      currentShapeIndex: this.state.currentShapeIndex === shapeIndex ? -1 : shapeIndex
    })
  }

  render() {
    const { pageMainColor, faceFileID, shapeList, currentShapeIndex } = this.state
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
                      const { shapeIndex, left, top, width, height, age, expressionStr, beauty, glassStr, hatStr, maskStr,
                      } = shape

                      let isActive = currentShapeIndex === shapeIndex

                      console.log('expressionStr :', expressionStr);
                      return (
                        <View key={shapeIndex} onClick={this.onChooseShape.bind(this, shapeIndex)} className={`shape-item ${isActive ? 'shape-item-active' : ''}`} style={{ left: left+ 'px', top: top + 'px', width: width + 'px', height: height + 'px' }}>
                          <View className="face-line left-top"></View>
                          <View className="face-line right-top"></View>
                          <View className="face-line left-bottom"></View>
                          <View className="face-line right-bottom"></View>
                          {isActive && (
                            <View className={`shape-desc ${left > 300 || left < 100 ? 'to-left' : 'to-right'}`}>
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
        </View>
        <View className='main-button' onClick={this.chooseImage}>上传</View>
      </View>
    )
  }
}