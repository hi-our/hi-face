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
      ...resetState(),
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
    const {
      hatCenterX,
      hatCenterY,
      cancelCenterX,
      cancelCenterY,
      handleCenterX,
      handleCenterY,
      scale,
      rotate
    } = this.state
    this.hat_center_x = hatCenterX;
    this.hat_center_y = hatCenterY;
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
      const hatCenterX = mouthMidPoint.X / dpr
      const hatCenterY =  mouthMidPoint.Y / dpr
      const scale = faceWidth / MASK_SIZE / dpr
      const rotate = angle / Math.PI * 180


      // 角度计算有点难
      let widthScaleDpr = Math.sin(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50
      let heightScaleDpr = Math.cos(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50

      const cancelCenterX = (mouthMidPoint.X - widthScaleDpr) / dpr - 2
      const cancelCenterY = (mouthMidPoint.Y - heightScaleDpr) / dpr - 2
      const handleCenterX = (mouthMidPoint.X + widthScaleDpr) / dpr - 2
      const handleCenterY = (mouthMidPoint.Y + heightScaleDpr) / dpr - 2

      this.setState({
        ...resetState(),
        isShowMask: true,
        hatCenterX,
        hatCenterY,
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
      hatCenterX,
      hatCenterY,
      currentHatId,
      cutImageSrc
    } = this.state
    this.setState({
      isSavePicture: true
    })

    const pc = Taro.createCanvasContext('canvasMask')
    // const pc = this.canvasMaskRef
    const hatSize = 100 * scale;

    pc.clearRect(0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    let tmpCutImage = await getImg(cutImageSrc)
    pc.drawImage(tmpCutImage, 0, 0, DPR_CANVAS_SIZE, DPR_CANVAS_SIZE);
    pc.save()
    pc.translate(hatCenterX, hatCenterY);
    pc.rotate((rotate * Math.PI) / 180);

    try {
      let maskSrc = await getImg(Mask1Image)
      console.log('maskSrc :', maskSrc);
      
      if (maskSrc) {
        pc.drawImage(
          maskSrc,
          // this.state.cutImageSrc,
          -hatSize / 2,
          -hatSize / 2,
          hatSize,
          hatSize
        )
      }
      
    } catch (error) {
      console.log('error :', error);
    }
    pc.restore()
    pc.draw()
  }

  downloadImage = async () => {

    let that = this

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
              that.saveFinally()
              Taro.hideLoading()
              Taro.showToast({
                title: '图片保存成功'
              })
              console.log('保存成功 :', res2);
            },
            fail(e) {
              that.saveFinally()
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
    const hatId = e.target.dataset.hatId
    console.log('object :', hatId);
    this.setState({
      currentHatId: e.target.dataset.hatId
    })
  }

  touchStart = (e) => {
    if (e.target.id == 'hat') {
      this.touch_target = 'hat';
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
    this.hat_center_x = this.state.hatCenterX;
    this.hat_center_y = this.state.hatCenterY;
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
    if (this.touch_target == 'hat') {
      this.setState({
        hatCenterX: this.state.hatCenterX + moved_x,
        hatCenterY: this.state.hatCenterY + moved_y,
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
        cancelCenterX: 2 * this.state.hatCenterX - this.state.handleCenterX,
        cancelCenterY: 2 * this.state.hatCenterY - this.state.handleCenterY
      });
      let diff_x_before = this.handle_center_x - this.hat_center_x;
      let diff_y_before = this.handle_center_y - this.hat_center_y;
      let diff_x_after = this.state.handleCenterX - this.hat_center_x;
      let diff_y_after = this.state.handleCenterY - this.hat_center_y;
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

    // let cancelStyle = {
    //   top: cancelCenterY -10 + 'px',
    //   left: cancelCenterX - 10 + 'px'
    // }

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
                      <Image className="hat" id='hat' src={require(`../../images/mask-${currentHatId}.png`)} style={hatStyle} />
                      {/* <Icon type="cancel" className="image-btn-cancel" id="cancel" style={cancelStyle} /> */}
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
                imgList.map(imgId => {
                  return (
                    <Image
                      className="image-item"
                      key={imgId}
                      src={require(`../../images/mask-${imgId }.png`)}
                      onClick={this.chooseMask}
                      data-hat-id={imgId}
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