const testImage = 'https://n1image.hjfile.cn/res7/2020/01/31/8ab8ff439233f3beae97a06c2b2bdec2.jpeg'

import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas, ScrollView } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import ImageCropper from 'components/image-cropper-taro'
import fetch from 'utils/fetch'
import { apiAnalyzeFace } from 'constants/apis'
import { getSystemInfo } from 'utils/common'
import { getHatInfo, getMouthInfo, getBase64Main } from 'utils/face-utils'
import { srcToBase64Main, getImg } from 'utils/canvas-drawing'

import { NOT_FACE, ONE_FACE } from 'constants/image-test'
import { TaroCropper } from 'taro-cropper'
import Mask1Image from '../../images/mask-1.png'

// const Mask1Image = 'https://n1image.hjfile.cn/res7/2020/02/01/b63c990ca4ab8fd2430118190c70314f.png'


// const testImg = 'https://n1image.hjfile.cn/res7/2020/01/31/85a57f8e140431329c0439a00e13c1a0.jpeg'
const testImg = 'https://n1image.hjfile.cn/res7/2020/02/01/73b0d0794e4390779767721f453b9794.png'

const imageData = ONE_FACE

import './styles.styl'

const { windowWidth } = getSystemInfo()
const CANVAS_SIZE = 300
const DPR_CANVAS_SIZE = CANVAS_SIZE * windowWidth / 375
const MASK_SIZE = 100

const resetState = () => {
  return {
    hatCenterX: windowWidth / 2,
    hatCenterY: 150,
    cancelCenterX: windowWidth / 2 - 50 - 2,
    cancelCenterY: 100,
    handleCenterX: windowWidth / 2 + 50 - 2,
    handleCenterY: 200,

    hatSize: 100 / (375 / windowWidth),

    scale: 1,
    rotate: 0
  }
}

// @CorePage
class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
  }

  constructor(props) {
    super(props);
    this.catTaroCropper = this.catTaroCropper.bind(this);
    this.state = {
      originSrc:  '', //testImg,
      cutImageSrc: '', //testImg,
      imgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

      currentHatId: 1,
      isShowMask: false,
      isSavePicture: false

    }
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2018/12/20/9de3c702be8dea2066b44913e95a9f8c.jpg?imageView2/1/w/375/h/300'

    return {
      title: '自动戴口罩',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/wear-a-mask/wear-a-mask'
    }
  }

  componentDidMount() {
    this.setState({
      cutImageSrc: imageData
    })
    this.onAnalyzeFace(getBase64Main(imageData))
  }



  catTaroCropper(node) {
    this.taroCropper = node;
    console.log('this.taroCropper :', this.taroCropper);
  }

  onChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
    }).then(res => {
      // console.log(res);
      this.setState({
        originSrc: res.tempFilePaths[0]
      });
    })
  }

  onCut = (cutImageSrc) => {
    let that = this
    console.log('cutImageSrc :', cutImageSrc);
    this.setState({
      cutImageSrc,
      originSrc: ''
    }, async () => {
        srcToBase64Main(cutImageSrc, (base64Main) => {
          that.onAnalyzeFace(base64Main)
        })
    })
  }


  onAnalyzeFace = async (base64Main = '' ) => {
    if (!base64Main) return

    Taro.showLoading()

    this.setState({
      isShowMask: false,
    })

    try {
      const res2 = await fetch({
        url: apiAnalyzeFace,
        type: 'post',
        data: {
          Image: base64Main,
          Mode: 1,
          FaceModelVersion: '3.0'
        }
      })

      const info = getMouthInfo(res2)
      let { faceWidth, angle, mouthMidPoint, ImageWidth } = info[0]
      let dpr = ImageWidth / CANVAS_SIZE * (375 / windowWidth)
      const hatCenterX = mouthMidPoint.X / dpr
      const hatCenterY =  mouthMidPoint.Y / dpr
      const scale = faceWidth / MASK_SIZE / dpr
      const rotate = angle / (Math.PI / 180)

      this.setState({
        ...resetState(),
        isShowMask: true,
        hatCenterX,
        hatCenterY,
        scale,
        rotate,
      })

      Taro.hideLoading()

    } catch (error) {
      Taro.hideLoading()
      this.setState({
        ...resetState(),
        isShowMask: true,
      })
      console.log('error :', error);
    }
  }

  onCancel = () => {
    this.setState({
      originSrc: ''
    })
    Taro.showToast({
      icon: 'none',
      title: '点击取消'
    })
  }

  onRemoveImage = () => {
    this.setState({
      ...resetState(),
      cutImageSrc: ''
    })
  }

  drawCanvas = async () => {
    const {
      scale,
      rotate,
      hatCenterX,
      hatCenterY,
      currentHatId,
      cutImageSrc
    } = this.state
    this.setState({
      isSavePicture: true
    })
    console.log('cutImageSrc :', cutImageSrc);
    const pc = Taro.createCanvasContext('canvasMask')
    // const pc = this.canvasMaskRef
    const hatSize = 100 * scale;

    pc.clearRect(0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    let tmpCutImage = await getImg(cutImageSrc)
    pc.drawImage(tmpCutImage, 0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    pc.save()
    pc.translate(hatCenterX, hatCenterY);
    pc.rotate((rotate * Math.PI) / 180);

    let maskSrc = await getImg(require('../../images/mask-1.png'))
    console.log('maskSrc :', maskSrc);
    pc.drawImage(
      maskSrc,
      // this.state.cutImageSrc,
      -hatSize / 2,
      -hatSize / 2,
      hatSize,
      hatSize
    )
    pc.restore()
    pc.draw()
  }

  downloadImage = async () => {

    try {
      await this.drawCanvas()
    } catch (error) {
      console.log('error :', error);
    }
    console.log('downloadImage2 :');
    Taro.canvasToTempFilePath({
      x: 0,
      y: 0,
      height: DPR_CANVAS_SIZE,
      width: DPR_CANVAS_SIZE,
      destHeight: 300,
      destWidth: 300,
      canvasId: 'canvasMask',
      success: res => {
        console.log('res.tempFilePath :', res.tempFilePath);
        // app.globalData.successPic = res.tempFilePath;
        Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: res2 => {
            console.log('保存成功 :', res2);
            // console.log("success:" + res);
          },
          fail(e) {
            console.log("保存失败:" + e);
          }
        });
      }
    })
  }

  render() {
    const {
      originSrc,
      cutImageSrc,
      currentHatId,

      hatCenterX,
      hatCenterY,
      cancelCenterX,
      cancelCenterY,
      handleCenterX,
      handleCenterY,

      hatSize,

      scale,
      rotate,
      imgList,
      isShowMask,
      isSavePicture
    } = this.state
    let hatStyle = {
      top: hatCenterY - hatSize / 2 - 2 + 'px',
      left: hatCenterX - hatSize / 2 - 2 + 'px',
      transform: `rotate(${rotate+'deg'}) scale(${scale})`
    }

    return (
      <View className='mask-page'>
        <View className='main-wrap'>
          {cutImageSrc
            ? (
              <View className='image-wrap'>
                <Image
                  src={cutImageSrc}
                  mode='widthFix'
                  className='image-selected'
                />
                {isShowMask && <Image class="hat" id='hat' src={Mask1Image} style={hatStyle} />}
                {
                  isSavePicture && <Canvas className='canvas-mask' canvasId='canvasMask' ref={c => this.canvasMaskRef = c} />
                }

              </View>
            )
            : (
              <View className='to-choose' onClick={this.onChooseImage}>
              </View>
            )
          }
          {!!cutImageSrc && (
            <View className='button-wrap'>
              <Button className='button-remove' onClick={this.onRemoveImage}></Button>
              <Button className='button-download' onClick={this.downloadImage}></Button>
            </View>
          )}
        </View>
        <View className='cropper-wrap' hidden={!originSrc}>
          <TaroCropper
            src={originSrc}
            cropperWidth={CANVAS_SIZE * 2}
            cropperHeight={CANVAS_SIZE * 2}
            ref={this.catTaroCropper}
            fullScreen
            onCut={this.onCut}
            hideCancelText={false}
            onCancel={this.onCancel}
          />
        </View>
        <ScrollView className="mask-select-wrap" scrollX>
          {
            imgList.map((img, index) => {
              return (
                <Image className="image-item" key={index} src={require(`../../images/mask-${ index+ 1}.png`)} />
              )
            })
          }
        </ScrollView>
        
      </View>
    )
  }
}