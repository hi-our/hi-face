import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button, Canvas, ScrollView, Block } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch'
import { getSystemInfo } from 'utils/common'
import { getMouthInfo } from 'utils/face-utils'
import { getImg } from 'utils/canvas-drawing'
import { TaroCropper } from 'taro-cropper'

import one_face_image from '../../images/one_face.jpeg';
import two_face_image from '../../images/two_face.jpg';

import './styles.styl'

const { windowWidth, pixelRatio } = getSystemInfo()
const CANVAS_SIZE = 300
const PageDpr = windowWidth / 375

const DPR_CANVAS_SIZE = CANVAS_SIZE * PageDpr
const SAVE_IMAGE_WIDTH = DPR_CANVAS_SIZE * pixelRatio
const DEFAULT_MASK_SIZE = 100 * PageDpr
const MASK_SIZE = 100


const resetState = () => {
  return {
    maskWidth: DEFAULT_MASK_SIZE,
    currentMaskId: 1,
    timeNow: Date.now(),

    maskCenterX: DPR_CANVAS_SIZE / 2,
    maskCenterY: DPR_CANVAS_SIZE / 2,
    resizeCenterX: DPR_CANVAS_SIZE / 2 + DEFAULT_MASK_SIZE / 2 - 2,
    resizeCenterY: DPR_CANVAS_SIZE / 2 + DEFAULT_MASK_SIZE / 2 - 2,
    rotate: 0
  }
}

const setTmpThis = (el, elState) => {
  const {
    maskWidth,
    maskCenterX,
    maskCenterY,
    resizeCenterX,
    resizeCenterY,
    rotate
  } = elState

  el.mask_width = maskWidth
  el.mask_center_x = maskCenterX;
  el.mask_center_y = maskCenterY;
  el.resize_center_x = resizeCenterX;
  el.resize_center_y = resizeCenterY;

  el.rotate = rotate;

  el.touch_target = '';
  el.touch_shape_index = -1;

}

const materialList = [
  {
    name: 'mask',
    icon: require('../../images/icon-category-mask.png'),
    imgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: 'multi'
  },
  {
    name: 'jiayou',
    icon: require('../../images/icon-category-jiayou.png'),
    imgList: [1, 2, 3, 4, 5, 6],
    type: 'single'
  }
]

// @CorePage
class WearMask extends Component {
  config = {
    navigationBarTitleText: '快快戴口罩',
    disableScroll: true
  }

  constructor(props) {
    super(props);
    this.catTaroCropper = this.catTaroCropper.bind(this);
    this.state = {
      shapeList: [
        resetState()
      ],
      currentShapeIndex: 0,
      originSrc:  '',
      cutImageSrc: '',
      posterSrc: '',
      isShowPoster: false,
      currentJiayouId: 1,
      currentTabIndex: 0,
      isShowMask: false,
    }

    this.cutImageSrcCanvas = ''
  }

  onShareAppMessage({ from, target }) {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    let shareImage = DEFAULT_SHARE_COVER
    if (from === 'button') {
      const { dataset = {} } = target
      const { posterSrc = '' } = dataset

      if (posterSrc) {
        shareImage = posterSrc
      }
    }

    return {
      title: '让我们快快戴口罩，抗击疫情吧！',
      imageUrl: shareImage,
      path: '/pages/wear-a-mask/wear-a-mask'
    }
  }

  async componentDidMount() {
    setTmpThis(this, this.state.shapeList[0])

    this.start_x = 0;
    this.start_y = 0;

    // this.setState({
    //   cutImageSrc: two_face_image
    // }, () => {
    //     this.onAnalyzeFace(two_face_image)
    // })

  }


  catTaroCropper(node) {
    this.taroCropper = node;
  }

  onChooseImage = (event) => {
    const way = event.target.dataset.way
    Taro.chooseImage({
      count: 1,
      sourceType: [way],
    }).then(res => {
      this.setState({
        originSrc: res.tempFilePaths[0]
      });
    }).catch(error => {
      console.log('error :', error);
    })
  }

  onGetUserInfo =  async (e) => {

    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      // TODO写法，用于更换图片
      let avatarUrl = await getImg(e.detail.userInfo.avatarUrl)
      this.onCut(avatarUrl)
    } else {
      //用户按了拒绝按钮
    }
  }

  onCut = (cutImageSrc) => {
    this.setState({
      cutImageSrc,
      originSrc: ''
    }, () => { 
      this.onAnalyzeFace(cutImageSrc)
    })
  }

  cloudCanvasToAnalyze = async (tempFilePaths) => {

    return new Promise((resolve, reject) => {
      // 上传图片
      Taro.cloud.uploadFile({
        cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`, // 随机图片名
        filePath: tempFilePaths, // 本地的图片路径
        success: (uploadRes) => {
          const { fileID } = uploadRes
          cloudCallFunction({
            name: 'analyze-face',
            data: {
              fileID
            }
          }).then(cloudRes => {
            resolve(cloudRes)
            Taro.cloud.deleteFile({
              fileList: [fileID],
              success: res => {
                // handle success
                console.log('临时图片删除成功', res.fileList)
              },
              fail: error => {
                console.log('临时图片删除失败', error)
              },
            })
          }).catch(error => {
            console.log('error :', error);
            reject(error)
          })
        },
        fail: (error) => {
          console.log('error :', error);
          reject(error)
        }
      })
    })
  }

  // TODO 其他小程序再说
  tmpFetchFunction = () => {
    // srcToBase64Main(cutImageSrc, (base64Main) => {
    // })
    // const res2 = await fetch({
    //   url: apiAnalyzeFace,
    //   type: 'post',
    //   data: {
    //     Image: base64Main,
    //     Mode: 1,
    //     FaceModelVersion: '3.0'
    //   }
    // })
  }


  onAnalyzeFace = async (cutImageSrc) => {
    if (!cutImageSrc) return

    Taro.showLoading({
      title: '识别中...'
    })

    this.setState({
      isShowMask: false,
    })

    try {

      const res2 = await this.cloudCanvasToAnalyze(cutImageSrc)
      console.log('图片分析的结果 :', res2);

      const info = getMouthInfo(res2)
      let shapeList = info.map(item => {
        let { faceWidth, angle, mouthMidPoint, ImageWidth } = item
        let dpr = ImageWidth / CANVAS_SIZE * (375 / windowWidth)
        const maskCenterX = mouthMidPoint.X / dpr
        const maskCenterY = mouthMidPoint.Y / dpr
        const scale = faceWidth / MASK_SIZE / dpr
        const rotate = angle / Math.PI * 180

        // 角度计算有点难
        let widthScaleDpr = Math.sin(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50
        let heightScaleDpr = Math.cos(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50

        const resizeCenterX = maskCenterX + widthScaleDpr - 2
        const resizeCenterY = maskCenterY + heightScaleDpr - 2

        const maskWidth = faceWidth * 1.2 / dpr

        return {
          maskWidth,
          currentMaskId: 1,
          timeNow: Date.now() * Math.random(),
          maskCenterX,
          maskCenterY,
          rotate,
          resizeCenterX,
          resizeCenterY,
        }

      })

      setTmpThis(this, shapeList[0])

      this.setState({
        currentShapeIndex: 0,
        shapeList,
        isShowMask: true,
      })

      Taro.hideLoading()

    } catch (error) {
      Taro.hideLoading()
      let shapeList =  [
        resetState()
      ]
      this.setState({
        shapeList,
        isShowMask: true,
      })
      setTmpThis(this, shapeList[0])
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
    this.cutImageSrcCanvas = ''
    this.setState({
      shapeList: [
        resetState()
      ],
      cutImageSrc: ''
    })
  }

  drawCanvas = async () => {
    const {
      shapeList,
      currentJiayouId,
      cutImageSrc
    } = this.state

    const pc = Taro.createCanvasContext('canvasMask')
    const tmpUsePageDpr = PageDpr * pixelRatio
    
    pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH);
    let tmpCutImage = this.cutImageSrcCanvas || await getImg(cutImageSrc)
    pc.drawImage(tmpCutImage, 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)
    
    // 形状
    shapeList.forEach(shape => {
      pc.save()
      const {
        maskWidth,
        rotate,
        maskCenterX,
        maskCenterY,
        currentMaskId,
      } = shape
      const maskSize = maskWidth *  pixelRatio

      pc.translate(maskCenterX * pixelRatio, maskCenterY * pixelRatio);
      pc.rotate((rotate * Math.PI) / 180)
  
      pc.drawImage(
        require(`../../images/mask-${currentMaskId}.png`),
        -maskSize / 2,
        -maskSize / 2,
        maskSize,
        maskSize
      )
      pc.restore()
    })

    if (currentJiayouId > 0) {
      pc.save()

      pc.drawImage(
        require(`../../images/jiayou-${currentJiayouId}.png`),
        0,
        132 * tmpUsePageDpr,
        300 * tmpUsePageDpr,
        169 * tmpUsePageDpr,
      )
    }

    pc.draw()
    
  }

  saveImageToPhotosAlbum = (tempFilePath) => {
    Taro.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: res2 => {
        Taro.showToast({
          title: '图片保存成功'
        })
        console.log('保存成功 :', res2);
      },
      fail(e) {
        Taro.showToast({
          title: '图片未保存成功'
        })
        console.log('图片未保存成功:' + e);
      }
    });
  }

  downloadImage = async () => {
    Taro.showLoading({
      title: '图片生成中'
    })

    try {
      await this.drawCanvas()

      Taro.canvasToTempFilePath({
        canvasId: 'canvasMask',
        x: 0,
        y: 0,
        height: DPR_CANVAS_SIZE * 3,
        width: DPR_CANVAS_SIZE * 3,
        success: res => {
          Taro.hideLoading()
          this.setState({
            posterSrc: res.tempFilePath,
            isShowPoster: true
          })
        },
        fail: () => {
          Taro.hideLoading()
          Taro.showToast({
            title: '图片生成失败，请重试'
          })
        }
      })

    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({
        title: '图片生成失败，请重试'
      })
      console.log('error :', error)
    }
  }


  chooseMask = (maskId) => {
    let { shapeList, currentShapeIndex } = this.state

    if (shapeList.length > 0 && currentShapeIndex >= 0) {
      shapeList[currentShapeIndex] = {
        ...shapeList[currentShapeIndex],
        currentMaskId: maskId
      }
    } else {
      currentShapeIndex = shapeList.length
      shapeList.push({
        ...resetState(),
        currentMaskId: maskId
      })
    }
    this.setState({
      shapeList,
      currentShapeIndex
    })
  }

  removeShape = (e) => {
    const { shapeIndex = 0 } = e.target.dataset
    const { shapeList } = this.state
    shapeList.splice(shapeIndex, 1);
    this.setState({
      shapeList,
      currentShapeIndex: -1
    })
  }


  checkedShape = (e) => {
    this.setState({
      currentShapeIndex: -1
    })
  }

  touchStart = (e) => {
    const { type = '', shapeIndex = 0 } = e.target.dataset
 
    this.touch_target = type;
    this.touch_shape_index = shapeIndex;
    if (shapeIndex !== this.state.currentShapeIndex) {
      this.setState({
        currentShapeIndex: shapeIndex
      })
    }

    if (this.touch_target != '') {
      this.start_x = e.touches[0].clientX;
      this.start_y = e.touches[0].clientY;
    }
  }
  touchEnd = (e) => {
    if (this.touch_target !== '' || this.touch_target !== 'cancel') {
      if (this.state.shapeList[this.touch_shape_index]) {
        setTmpThis(this, this.state.shapeList[this.touch_shape_index])
      }
    }
  }
  touchMove = (e) => {
    let { shapeList } = this.state
    const {
      maskCenterX,
      maskCenterY,
      resizeCenterX,
      resizeCenterY,
    } = shapeList[this.touch_shape_index]

    var current_x = e.touches[0].clientX;
    var current_y = e.touches[0].clientY;
    var moved_x = current_x - this.start_x;
    var moved_y = current_y - this.start_y;
    if (this.touch_target == 'mask') {
      shapeList[this.touch_shape_index] = {
        ...shapeList[this.touch_shape_index],
        maskCenterX: maskCenterX + moved_x,
        maskCenterY: maskCenterY + moved_y,
        resizeCenterX: resizeCenterX + moved_x,
        resizeCenterY: resizeCenterY + moved_y
      }
      this.setState({
        shapeList
      })
    }
    if (this.touch_target == 'rotate-resize') {
      let oneState = {
        resizeCenterX: resizeCenterX + moved_x,
        resizeCenterY: resizeCenterY + moved_y,
      }

      let diff_x_before = this.resize_center_x - this.mask_center_x;
      let diff_y_before = this.resize_center_y - this.mask_center_y;
      let diff_x_after = resizeCenterX - this.mask_center_x;
      let diff_y_after = resizeCenterY - this.mask_center_y;
      let distance_before = Math.sqrt(
        diff_x_before * diff_x_before + diff_y_before * diff_y_before
      );

      let distance_after = Math.sqrt(
        diff_x_after * diff_x_after + diff_y_after * diff_y_after
      );

      let angle_before = (Math.atan2(diff_y_before, diff_x_before) / Math.PI) * 180;
      let angle_after = (Math.atan2(diff_y_after, diff_x_after) / Math.PI) * 180;

      let twoState = {
        maskWidth: (distance_after / distance_before) * this.mask_width ,
        rotate: angle_after - angle_before + this.rotate
      }

      shapeList[this.touch_shape_index] = {
        ...shapeList[this.touch_shape_index],
        ...oneState,
        ...twoState
      }

      this.setState({
        shapeList
      })

    }
    this.start_x = current_x;
    this.start_y = current_y;
  }

  goSpreadGame = () => {
    Taro.navigateTo({
      url: '/pages/spread-game/spread-game'
    })
  }

  chooseTab = (tabIndex) => {
    this.setState({
      currentTabIndex: tabIndex
    })
  }

  chooseJiayouId = (jiayouId = 0) => {
    this.setState({
      currentJiayouId: jiayouId
    })
  }

  previewPhoto = () => {
    const { posterSrc } = this.state
    if (posterSrc !== '') Taro.previewImage({ urls: [posterSrc] })
  }

  onHidePoster = () => {
    this.setState({
      isShowPoster: false
    })
  }

  savePoster = () => {
    const { posterSrc } = this.state

    if (posterSrc) {
      this.saveImageToPhotosAlbum(posterSrc)
    }
  }



  renderPoster = () => {
    const { posterSrc, isShowPoster } = this.state
    return (
      <View className={`poster-dialog ${isShowPoster ? 'show': ''}`}>
        <View className='poster-dialog-main'>
          <Image className='poster-image' src={posterSrc}></Image>
          <View className='poster-dialog-close' onClick={this.onHidePoster} />
          <View className='poster-footer-btn'>
            <View className='poster-btn-save' onClick={this.savePoster}>
              <Image
                className='icon'
                src='https://n1image.hjfile.cn/res7/2019/01/03/740198f541ce91859ed060882d986e09.png'
              />
              保存到相册
            </View>
            <Button className='poster-btn-share' openType='share' data-poster-src={posterSrc}>
              <Image
                className='icon-wechat'
                src='https://n1image.hjfile.cn/res7/2019/03/20/21af29d7755905b08d9f517223df5314.png'
              />
              分享给朋友
            </Button>
          </View>
        </View>
        
      </View>
    )
  }

  render() {
    const {
      originSrc,
      cutImageSrc,
      isShowMask,
      currentTabIndex,
      currentJiayouId,
      shapeList,
      currentShapeIndex,
    } = this.state


    let tabsTips = ''
    if (currentTabIndex === 0) {
      tabsTips = currentShapeIndex >= 0 ? '点击更换口罩' : '点击新增口罩'
    } else if (currentTabIndex === 1) {
      tabsTips = currentJiayouId >= 1 ? '点击更换文案图片' : '点击新增文案图片'
    }

    return (
      <View className='mask-page'>
        <Canvas className='canvas-mask' style={{ width: DPR_CANVAS_SIZE * pixelRatio + 'px', height: DPR_CANVAS_SIZE * pixelRatio + 'px' }} canvasId='canvasMask' ref={c => this.canvasMaskRef = c} />
        <View className='main-wrap'>
          <View
            className='image-position'
          >
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
                    isShowMask && shapeList.map((shape, shapeIndex) => {

                      const {
                        maskWidth,
                        currentMaskId,
                        timeNow,
                        maskCenterX,
                        maskCenterY,
                        rotate
                      } = shape

                      let transX = maskCenterX - maskWidth / 2 - 2 + 'px'
                      let transY = maskCenterY - maskWidth / 2 - 2 + 'px'

                      let maskStyle = {
                        width: maskWidth + 'px',
                        height: maskWidth + 'px',
                        transform: `translate(${transX}, ${transY}) rotate(${rotate + 'deg'})`
                      }

                      return (
                        <View className='mask-container' key={timeNow} style={maskStyle}>
                          <Image className="mask" data-type='mask' data-shape-index={shapeIndex} src={require(`../../images/mask-${currentMaskId}.png`)} />
                          {
                            currentShapeIndex === shapeIndex && (
                              <Block>
                                <View className='image-btn-remove' data-shape-index={shapeIndex}  onClick={this.removeShape}></View>
                                <View className='image-btn-resize' data-shape-index={shapeIndex} data-type='rotate-resize'></View>
                                <View className='image-btn-checked' data-shape-index={shapeIndex}  onClick={this.checkedShape}></View>
                              </Block>
                            )
                          }
                        </View>
                      )
                    })
                  }
                  {
                    isShowMask && currentJiayouId > 0 && (
                      <View className="image-jiayou">
                        <Image id='mask' src={require(`../../images/jiayou-${currentJiayouId}.png`)} />
                        <View className='image-btn-jiayou' onClick={this.chooseJiayouId}></View>
                      </View>
                    )
                  }
                </View>
              )
              : (
                <View className='to-choose' data-way="album" onClick={this.onChooseImage}></View>
                )
              }
          </View>
          {cutImageSrc
            ? (
              <View className='button-wrap'>
                <View className='button-remove' onClick={this.onRemoveImage}>
                  移除图片
                </View>
                <View className='button-download' onClick={this.downloadImage}>
                  保存图片
                </View>
              </View>
            ) 
            : (
              <View className='button-wrap'>
                <Button className="button-avatar" type="default" data-way="avatar" openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>使用头像</Button>
                <Button className='button-camera' type="default" data-way="camera" onClick={this.onChooseImage}>
                  使用相机
                </Button>
                <Button className='button-gallery' type="default" data-way="album" onClick={this.onChooseImage}>
                  相册选择
                </Button>
              </View>
            )
            
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
          cutImageSrc
            ? (
              <View className='tab-wrap'>
                <View className='tab-hd'>
                  {
                    materialList.map((item, itemIndex) => {
                      return (
                        <View
                          key={item.name}
                          className={`tab-hd-item ${currentTabIndex === itemIndex ? 'tab-hd-active' : ''}`}
                          onClick={this.chooseTab.bind(this, itemIndex)}
                        >
                          <Image
                            className='tab-hd-image'
                            src={item.icon}
                            mode='aspectFit'
                          />
                        </View>
                      )
                    })
                  }
                  <View className='tab-hd-tips'>
                    提示：{tabsTips}
                  </View>
                </View>
                <View className='tab-bd'>
                  {
                    materialList.map((item, itemIndex) => {
                      return (
                        <View key={item.name} style={{ display: currentTabIndex === itemIndex ? ' block' : 'none' }}>
                          <ScrollView className="mask-select-wrap" scrollX>
                            {
                              item.imgList.map((imgId) => {
                                return (
                                  <Image
                                    className={`tab-bd-image  tab-bd-image-${item.name}`}
                                    key={imgId}
                                    src={require(`../../images/${item.name}-${imgId}.png`)}
                                    onClick={() => {
                                      if (item.name === 'mask') this.chooseMask(imgId)
                                      if (item.name === 'jiayou') this.chooseJiayouId(imgId)
                                      
                                    }}
                                    data-mask-id={imgId}
                                  />
                                )
                              })
                            }
                          </ScrollView>
                        </View>
                      )
                    })
                  }
                </View>
                
              </View>
            )
            : (
              <View className='bottom-tips-wrap'>
                <Text>
                  {'备注：\n选择后会识别图中人脸，并自动戴上口罩\n识别过程需几秒钟，请耐心等待'}
                </Text>
              </View>
            )
        }

        {!originSrc && (
          <Block>
            <View className='virus-btn' onClick={this.goSpreadGame}>病毒演化器</View>
            <Button className='share-btn' openType='share'>分享给朋友<View className='share-btn-icon'></View></Button>
          </Block>
        )}
        {
          this.renderPoster()
        }
        
      </View>
    )
  }
}

export default WearMask