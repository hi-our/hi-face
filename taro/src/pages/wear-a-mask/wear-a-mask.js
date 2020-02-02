import Taro, { Component } from '@tarojs/taro'
import { View, Image, Icon, Text, Button, Canvas, ScrollView, Block } from '@tarojs/components'
import fetch from 'utils/fetch'
import { apiAnalyzeFace } from 'constants/apis'
import { getSystemInfo } from 'utils/common'
import { getMouthInfo, getBase64Main } from 'utils/face-utils'
import { srcToBase64Main, getImg } from 'utils/canvas-drawing'

import { TaroCropper } from 'taro-cropper'

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
    navigationBarTitleText: '一起戴口罩',
  }

  constructor(props) {
    super(props);
    this.catTaroCropper = this.catTaroCropper.bind(this);
    this.state = {
      ...resetState(),
      originSrc:  '',
      cutImageSrc: '',
      imgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

      currentMaskId: 1,
      isShowMask: false,
      isSavePicture: false
    }

    this.httpPathList = []
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '让我们一起戴口罩，抗击疫情吧！',
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

    
    // this.setState({
    //   cutImageSrc: imageData
    // })
    // this.onAnalyzeFace(getBase64Main(imageData))
    // this.getImageLocalPath(HTTP_LIST).then(res2 => {
    //   console.log('res2 :', res2);
    // })
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
  }

  onChooseImage = () => {
    Taro.chooseImage({
      count: 1,
    }).then(res => {
      this.setState({
        originSrc: res.tempFilePaths[0]
      });
    })
  }

  onCut = (cutImageSrc) => {
    let tmask = this
    // console.log('cutImageSrc :', cutImageSrc);
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
      title: '识别中，多等几秒'
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
    const maskSize = 100 * scale;

    pc.clearRect(0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    let tmpCutImage = await getImg(cutImageSrc)
    pc.drawImage(tmpCutImage, 0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    pc.save()
    pc.translate(maskCenterX, maskCenterY);
    pc.rotate((rotate * Math.PI) / 180)

    pc.drawImage(
      require(`../../images/mask-${currentMaskId}.png`),
      -maskSize / 2,
      -maskSize / 2,
      maskSize,
      maskSize
    )

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
        destHeight: 300 * 2,
        destWidth: 300 * 2,
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
    this.setState({
      currentMaskId: maskId
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
                  !isSavePicture && isShowMask && (
                    <Block>
                      <Image className="mask" id='mask' src={require(`../../images/mask-${currentMaskId}.png`)} style={maskStyle} />
                      {/* <Icon type="cancel" className="image-btn-cancel" id="cancel" style={cancelStyle} /> */}
                      <Icon type="waiting" className="image-btn-handle" id="handle" color="green" style={handleStyle} />
                    </Block>
                  )
                }
                <Canvas className='canvas-mask' canvasId='canvasMask' ref={c => this.canvasMaskRef = c} />
                {/* {isSavePicture && <Canvas className='canvas-mask' canvasId='canvasMask' ref={c => this.canvasMaskRef = c} />} */}


              </View>
            )
            : (
              <View className='to-choose' onClick={this.onChooseImage}>
              </View>
            )
          }
          {cutImageSrc
            ? (
              <View className='button-wrap'>
                <Button className='button-remove' onClick={this.onRemoveImage}>
                  移除图片
                </Button>
                <Button className='button-download' onClick={this.downloadImage}>
                  保存图片
                </Button>
              </View>
            ) 
            : <Text className='button-wrap'>{'备注：点击图片区域即可选择图片\n选择后，会自动识别图中人脸，并自动戴上口罩\n识别过程需几秒钟，请耐心等待'}</Text>
          }
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
                imgList.map((imgId) => {
                  return (
                    <Image
                      className="image-item"
                      key={imgId}
                      src={require(`../../images/mask-${imgId}.png`)}
                      onClick={this.chooseMask}
                      data-mask-id={imgId}
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