const testImage = 'https://n1image.hjfile.cn/res7/2020/01/31/8ab8ff439233f3beae97a06c2b2bdec2.jpeg'

import Taro, { Component } from '@tarojs/taro'
import { View, Image, Icon, Button, Canvas, ScrollView, Block } from '@tarojs/components'
import fetch from 'utils/fetch'
import { apiAnalyzeFace } from 'constants/apis'
import { getSystemInfo } from 'utils/common'
import { getMouthInfo, getBase64Main } from 'utils/face-utils'
import { srcToBase64Main, getImg } from 'utils/canvas-drawing'

import { NOT_FACE, ONE_FACE } from 'constants/image-test'
import { TaroCropper } from 'taro-cropper'

const Mask1Image = 'https://n1image.hjfile.cn/res7/2020/02/01/b63c990ca4ab8fd2430118190c70314f.png'


// const testImg = 'https://n1image.hjfile.cn/res7/2020/01/31/85a57f8e140431329c0439a00e13c1a0.jpeg'
// const testImg = 'https://n1image.hjfile.cn/res7/2020/02/01/73b0d0794e4390779767721f453b9794.png'

const HTTP_LIST = [
  'https://n1image.hjfile.cn/res7/2020/02/02/470f57c36363ed37618c7112d00e57a5.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/23c6f3c4229b624f32433c37606a558f.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/969453d4bde3b964d78334907e1fe83d.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/ca710b2ff33d16d62bfada7d063ed19c.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/f73c9c1f35124b4edba66cbf7dd730b8.png',

  'https://n1image.hjfile.cn/res7/2020/02/02/d89fa766c69f6cf46252938bda5a5604.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/4739879682c32288981ee12b9cb89527.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/03446d7c610190eb90fd269839a21d1d.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/47844ed9295e25da2025fa99617c9c29.png',
  'https://n1image.hjfile.cn/res7/2020/02/02/43395ea7a8ca7ea53ab4e2086c6f8ca1.png',
]

const imageData = NOT_FACE

import './styles.styl'

const { windowWidth } = getSystemInfo()
const CANVAS_SIZE = 300
const PageDpr = windowWidth / 375

const DPR_CANVAS_SIZE = CANVAS_SIZE * PageDpr
const DEFAULT_MASK_SIZE = 100 * PageDpr
const MASK_SIZE = 100

const resetState = () => {
  return {
    maskCenterX: DPR_CANVAS_SIZE / 2,
    maskCenterY: DPR_CANVAS_SIZE / 2,
    cancelCenterX: DPR_CANVAS_SIZE / 2 - DEFAULT_MASK_SIZE / 2 - 2,
    cancelCenterY: DPR_CANVAS_SIZE / 2 - DEFAULT_MASK_SIZE / 2 - 2,
    handleCenterX: DPR_CANVAS_SIZE / 2 + DEFAULT_MASK_SIZE / 2 - 2,
    handleCenterY: DPR_CANVAS_SIZE / 2 + DEFAULT_MASK_SIZE / 2 - 2,

    maskSize: DEFAULT_MASK_SIZE,

    scale: 1,
    rotate: 0
  }
}

// @CorePage
class WearMask extends Component {
  config = {
    navigationBarTitleText: '首页',
  }

  constructor(props) {
    super(props);
    this.catTaroCropper = this.catTaroCropper.bind(this);
    this.state = {
      ...resetState(),
      originSrc:  '', //testImg,
      cutImageSrc: '', //testImg,
      imgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

      currentMaskId: 1,
      isShowMask: false,
      isSavePicture: false
    }

    this.httpPathList = []
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
    const {
      maskCenterX,
      maskCenterY,
      cancelCenterX,
      cancelCenterY,
      handleCenterX,
      handleCenterY,
      scale,
      rotate
    } = this.state
    this.mask_center_x = maskCenterX;
    this.mask_center_y = maskCenterY;
    this.cancel_center_x = cancelCenterX;
    this.cancel_center_y = cancelCenterY;
    this.handle_center_x = handleCenterX;
    this.handle_center_y = handleCenterY;

    this.scale = scale;
    this.rotate = rotate;

    this.touch_target = '';
    this.start_x = 0;
    this.start_y = 0;

    
    this.setState({
      cutImageSrc: imageData
    })
    this.onAnalyzeFace(getBase64Main(imageData))
    this.getImageLocalPath(HTTP_LIST).then(res2 => {
      console.log('res2 :', res2);
    })
  }

  getImageLocalPath = (urlArr) => {
    return Promise.all(
      urlArr.map((url) => {
        console.log('url :', url);
        return new Promise((resolve, reject) => {
          if (url === '') {
            reject(new Error(`getImageLocalPath : ${url} fail`))
            console.log('下载图片失败，请重试')
          }
          Taro.getImageInfo({
            src: url,
            success: res => {
              resolve(res)
            },
            fail: e => {
              reject(new Error(`getImageLocalPath : ${url} fail ${e}`))
              console.log('下载图片失败，请重试')
            }
          })
        })
      })
    )
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
    let tmask = this
    console.log('cutImageSrc :', cutImageSrc);
    this.setState({
      cutImageSrc,
      originSrc: ''
    }, async () => {
        srcToBase64Main(cutImageSrc, (base64Main) => {
          tmask.onAnalyzeFace(base64Main)
        })
    })
  }


  onAnalyzeFace = async (base64Main = '' ) => {
    if (!base64Main) return

    Taro.showLoading({
      title: '图片识别中'
    })

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
      const maskCenterX = mouthMidPoint.X / dpr
      const maskCenterY =  mouthMidPoint.Y / dpr
      const scale = faceWidth / MASK_SIZE / dpr
      const rotate = angle / Math.PI * 180

      // 角度计算有点难
      let widthScaleDpr = Math.sin(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50
      let heightScaleDpr = Math.cos(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50

      const cancelCenterX = maskCenterX - widthScaleDpr - 2
      const cancelCenterY = maskCenterY - heightScaleDpr - 2
      const handleCenterX = maskCenterX + widthScaleDpr - 2
      const handleCenterY = maskCenterY + heightScaleDpr - 2

      this.setState({
        ...resetState(),
        isShowMask: true,
        maskCenterX,
        maskCenterY,
        scale,
        rotate,
        cancelCenterX,
        cancelCenterY,
        handleCenterX,
        handleCenterY,
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
      maskCenterX,
      maskCenterY,
      currentMaskId,
      cutImageSrc
    } = this.state
    this.setState({
      isSavePicture: true
    })

    const pc = Taro.createCanvasContext('canvasMask')
    // const pc = this.canvasMaskRef
    const maskSize = 100 * scale;

    pc.clearRect(0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    let tmpCutImage = await getImg(cutImageSrc)
    pc.drawImage(tmpCutImage, 0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    pc.save()
    pc.translate(maskCenterX, maskCenterY);
    pc.rotate((rotate * Math.PI) / 180);

    try {
      let maskSrc = await getImg(Mask1Image)
      console.log('maskSrc :', maskSrc);
      
      if (maskSrc) {
        pc.drawImage(
          maskSrc,
          // this.state.cutImageSrc,
          -maskSize / 2,
          -maskSize / 2,
          maskSize,
          maskSize
        )
      }
      
    } catch (error) {
      console.log('error :', error);
    }
    pc.restore()
    pc.draw()
  }

  downloadImage = async () => {

    let tmask = this

    Taro.showLoading({
      title: '图片生成中'
    })

    try {
      await this.drawCanvas()
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
              tmask.saveFinally()
              Taro.hideLoading()
              Taro.showToast({
                title: '图片保存成功'
              })
              console.log('保存成功 :', res2);
            },
            fail(e) {
              tmask.saveFinally()
              Taro.hideLoading()
              Taro.showToast({
                title: '图片未保存'
              })
              console.log('图片未保存:' + e);
            }
          });
        }
      })

    } catch (error) {
      this.saveFinally()
      Taro.hideLoading()
      Taro.showToast({
        title: '图片保存失败，请重试'
      })
      console.log('error :', error)
    }
    
    
  }

  saveFinally = () => this.setState({ isSavePicture: false})

  chooseMask = (e) => {
    const maskId = e.target.dataset.maskId
    console.log('object :', maskId);
    this.setState({
      currentMaskId: e.target.dataset.maskId
    })
  }

  touchStart = (e) => {
    if (e.target.id == 'mask') {
      this.touch_target = 'mask';
    } else if (e.target.id == 'handle') {
      this.touch_target = 'handle';
    } else {
      this.touch_target = '';
    }

    if (this.touch_target != '') {
      this.start_x = e.touches[0].clientX;
      this.start_y = e.touches[0].clientY;
    }
  }
  touchEnd = (e) => {
    this.mask_center_x = this.state.maskCenterX;
    this.mask_center_y = this.state.maskCenterY;
    this.cancel_center_x = this.state.cancelCenterX;
    this.cancel_center_y = this.state.cancelCenterY;
    this.handle_center_x = this.state.handleCenterX;
    this.handle_center_y = this.state.handleCenterY;
    // }
    this.touch_target = '';
    this.scale = this.state.scale;
    this.rotate = this.state.rotate;
  }
  touchMove = (e) => {
    var current_x = e.touches[0].clientX;
    var current_y = e.touches[0].clientY;
    var moved_x = current_x - this.start_x;
    var moved_y = current_y - this.start_y;
    if (this.touch_target == 'mask') {
      this.setState({
        maskCenterX: this.state.maskCenterX + moved_x,
        maskCenterY: this.state.maskCenterY + moved_y,
        cancelCenterX: this.state.cancelCenterX + moved_x,
        cancelCenterY: this.state.cancelCenterY + moved_y,
        handleCenterX: this.state.handleCenterX + moved_x,
        handleCenterY: this.state.handleCenterY + moved_y
      });
    }
    if (this.touch_target == 'handle') {
      this.setState({
        handleCenterX: this.state.handleCenterX + moved_x,
        handleCenterY: this.state.handleCenterY + moved_y,
        cancelCenterX: 2 * this.state.maskCenterX - this.state.handleCenterX,
        cancelCenterY: 2 * this.state.maskCenterY - this.state.handleCenterY
      });
      let diff_x_before = this.handle_center_x - this.mask_center_x;
      let diff_y_before = this.handle_center_y - this.mask_center_y;
      let diff_x_after = this.state.handleCenterX - this.mask_center_x;
      let diff_y_after = this.state.handleCenterY - this.mask_center_y;
      let distance_before = Math.sqrt(
        diff_x_before * diff_x_before + diff_y_before * diff_y_before
      );
      let distance_after = Math.sqrt(
        diff_x_after * diff_x_after + diff_y_after * diff_y_after
      );
      let angle_before =
        (Math.atan2(diff_y_before, diff_x_before) / Math.PI) * 180;
      let angle_after =
        (Math.atan2(diff_y_after, diff_x_after) / Math.PI) * 180;
      this.setState({
        scale: (distance_after / distance_before) * this.scale,
        rotate: angle_after - angle_before + this.rotate
      });
    }
    this.start_x = current_x;
    this.start_y = current_y;
  }

  render() {
    const {
      originSrc,
      cutImageSrc,
      currentMaskId,

      maskCenterX,
      maskCenterY,
      cancelCenterX,
      cancelCenterY,
      handleCenterX,
      handleCenterY,

      maskSize,

      scale,
      rotate,
      imgList,
      isShowMask,
      isSavePicture
    } = this.state
    let maskStyle = {
      top: maskCenterY - maskSize / 2 - 2 + 'px',
      left: maskCenterX - maskSize / 2 - 2 + 'px',
      transform: `rotate(${rotate+'deg'}) scale(${scale})`
    }

    let cancelStyle = {
      top: cancelCenterY -10 + 'px',
      left: cancelCenterX - 10 + 'px'
    }

    let handleStyle = {
      top: handleCenterY -10 + 'px',
      left: handleCenterX - 10 + 'px'
    }

    return (
      <View className='mask-page'>
        <View className='main-wrap'>
          {cutImageSrc
            ? (
              <View
                className='image-wrap'
                onTouchStart={this.touchStart}
                onTouchMove={this.touchMove}
                onTouchEnd={this.touchEnd}
              >
                <Image
                  src={cutImageSrc}
                  mode='widthFix'
                  className='image-selected'
                />
                {
                  isShowMask && (
                    <Block>
                      <Image className="mask" id='mask' src={HTTP_LIST[currentMaskId]} style={maskStyle} />
                      <Icon type="cancel" className="image-btn-cancel" id="cancel" style={cancelStyle} />
                      <Icon type="waiting" className="image-btn-handle" id="handle" color="green" style={handleStyle} />
                    </Block>
                  )
                }
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
        {
          !!cutImageSrc && (
            <ScrollView className="mask-select-wrap" scrollX>
              {
                HTTP_LIST.map((imgSrc, index) => {
                  return (
                    <Image
                      className="image-item"
                      key={imgSrc}
                      src={imgSrc}
                      onClick={this.chooseMask}
                      data-mask-id={index}
                    />
                  )
                })
              }
            </ScrollView>
          )
        }
        
      </View>
    )
  }
}

export default WearMask