import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { STATUS_BAR_HEIGHT, SAVE_IMAGE_WIDTH, getDefaultShape } from './utils'
import ImageChoose from './components/image-choose'
import ShapeEdit from './components/shape-edit'
import { getHatInfo, getHatShapeList } from 'utils/face-utils'
import { getImg, fsmReadFile, srcToBase64Main, getBase64Main, downloadImgByBase64 } from 'utils/canvas-drawing'
import { cloudCallFunction } from 'utils/fetch'

import './styles.styl'

const isH5Page = process.env.TARO_ENV === 'h5'
const isQQPage = process.env.TARO_ENV === 'qq'



// @CorePage
class AvatarEdit extends Component {
  config = {
    navigationBarTitleText: '头像编辑',
    navigationStyle: 'custom',
    disableScroll: true
  }

  constructor(props) {
    super(props)
    this.state = {
      cutImageSrc: '',
      isShowShape: false
    }
  }

  onChoose = (cutImageSrc) => {
    this.setState({
      cutImageSrc
    }, () => {
        this.onAnalyzeFace(cutImageSrc)
    })
  }

  onAnalyzeFace = async (cutImageSrc) => {
    if (!cutImageSrc) return

    Taro.showLoading({
      title: '识别中...'
    })

    this.setState({
      isShowShape: false,
    })

    try {

      let cloudFunc = isH5Page ? this.cloudCanvasToAnalyzeH5 : this.cloudCanvasToAnalyze

      const couldRes = await cloudFunc(cutImageSrc)

      console.log('图片分析的结果 :', couldRes)
      const hatList = getHatInfo(couldRes)
      console.log('hatList :', hatList);

      let faceList = hatList.map(item => item.faceInfo)
      let shapeList = getHatShapeList(hatList, SAVE_IMAGE_WIDTH)

      console.log('faceList :>> ', faceList);

      this.setState({
        shapeList,
        isShowShape: true,
        faceList
      })

      Taro.hideLoading()

      // this.uploadOriginImage(cutImageSrc)


    } catch (error) {
      console.log('onAnalyzeFace error :', error);

      Taro.hideLoading()
      const { status } = error

      if (status === 87014) {
        Taro.showToast({
          icon: 'none',
          title: '图中包含违规内容，请更换'
        })
        this.setState({
          cutImageSrc: ''
        })
        return
      }

      // 获取失败，走默认渲染
      let shapeList = [
        getDefaultShape()
      ]

      this.setState({
        shapeList,
        isShowShape: true,
      })

      // this.uploadOriginImage(cutImageSrc)
    }
  }

  cloudCanvasToAnalyzeH5 = async (tempFilePaths) => {

    const couldRes = await cloudCallFunction({
      name: 'analyze-face',
      data: {
        base64Main: getBase64Main(tempFilePaths)
      }
    })
    return couldRes
  }

  cloudCanvasToAnalyze = async (tempFilePaths) => {

    const resImage = await Taro.compressImage({
      src: tempFilePaths, // 图片路径
      quality: 10 // 压缩质量
    })

    let { data: base64Main } = await fsmReadFile({
      filePath: resImage.tempFilePath,
      encoding: 'base64',
    })

    const couldRes = await cloudCallFunction({
      name: 'analyze-face',
      data: {
        base64Main
      }
    })

    return couldRes
  }

  render() {
    const { isShowShape, cutImageSrc, shapeList } = this.state
    return (
      <View className='avatar-edit-page' style={{ paddingTop: STATUS_BAR_HEIGHT + 'px' }}>
        <View className='page-title'>人像魅力</View>
        <Canvas className='canvas-shape' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_WIDTH + 'px' }} canvasId='canvasShape' ref={c => this.canvasShapeRef = c} />
        <View className='main-wrap'>
          {isShowShape
            ? (
              <ShapeEdit
                cutImageSrc={cutImageSrc}
                shapeListOut={shapeList}
              />
              )
            : (
              <ImageChoose
                onChoose={this.onChoose}
              />
            )
          }
          
        </View>
      </View>
    )
  }
}