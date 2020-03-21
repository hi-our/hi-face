import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button, Canvas, ScrollView, Block } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch'
import { getSystemInfo, h5PageModalTips } from 'utils/common'
import { getHatInfo, getHatShapeList } from 'utils/face-utils'
import { getImg, fsmReadFile, srcToBase64Main, getBase64Main, downloadImgByBase64 } from 'utils/canvas-drawing'
import TaroCropper from 'components/taro-cropper'
import promisify from 'utils/promisify'

import one_face_image from '../../images/one_face.jpeg';
import two_face_image from '../../images/two_face.jpg';

import {
  ORIGIN_CANVAS_SIZE,
  ORIGiN_SHAPE_SIZE,
  PAGE_DPR,
  DPR_CANVAS_SIZE,
  SAVE_IMAGE_WIDTH,
  DEFAULT_SHAPE_SIZE,
  getDefaultShape,
  setTmpThis,
  materialList,
  dataStyleList,
  getDefaultAgeMap,
} from './utils';

import './styles.styl'

const { pixelRatio } = getSystemInfo()

const isH5Page = process.env.TARO_ENV === 'h5'
const isQQPage = process.env.TARO_ENV === 'qq'


class QueenKing extends Component {
  config = {
    navigationBarTitleText: '女王戴皇冠',
    disableScroll: true
  }

  constructor(props) {
    super(props)
    this.catTaroCropper = this.catTaroCropper.bind(this);
    this.state = {
      shapeList: [
        getDefaultShape()
      ],
      shareUUID: '', // 保存图片上传后的图片uuid
      currentAgeType: 'origin',
      currentShapeIndex: 0,
      originSrc: '',
      cutImageSrc: '',
      posterSrc: '',
      originFileID: '', // 上传到云存储的文件
      isShowPoster: false,
      currentJiayouId: 1,
      currentTabIndex: 0,
      isShowShape: false,
    }
    this.ageMap = getDefaultAgeMap()
    this.cutImageSrcCanvas = ''
  }

  onShareAppMessage({ from, target }) {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    let shareImage = DEFAULT_SHARE_COVER
    let shareUrl = '/pages/queen-king/queen-king'
    if (from === 'button') {
      const { dataset = {} } = target
      const { posterSrc = '' } = dataset

      console.log('posterSrc :', posterSrc);

      if (posterSrc) {
        shareImage = posterSrc
        const { shareUUID } = this.state
        if (shareUUID) {
          shareUrl = `/pages/avatar-poster/avatar-poster?uuid=${shareUUID}`
        }
      }

    }

    console.log('shareUrl :', shareUrl);
    return {
      title: '给女神戴上皇冠吧！',
      imageUrl: shareImage,
      path: shareUrl
    }
  }

  async componentDidMount() {
    setTmpThis(this, this.state.shapeList[0])

    this.showH5Modal()

    this.start_x = 0;
    this.start_y = 0;


    // this.ageMap.origin = two_face_image
    // this.setState({
    //   cutImageSrc: two_face_image
    // }, () => {
    //     this.onAnalyzeFace(two_face_image)
    // })

  }

  showH5Modal = () => {
    if (isH5Page) {
      h5PageModalTips()
    }
  }


  catTaroCropper(node) {
    this.taroCropper = node;
  }

  onChooseImage = (way) => {

    // console.log('event :', event);
    // TODO 兼容写法
    // let way = event.target.dataset.way || 'album'

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

  onGetUserInfo = async (e) => {

    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      // TODO写法，用于更换图片
      Taro.showToast({
        icon: 'none',
        title: '获取头像...'
      })
      try {
        let avatarUrl = await getImg(e.detail.userInfo.avatarUrl)
        if (avatarUrl) {
          this.onCut(avatarUrl)
        }

      } catch (error) {
        console.log('avatarUrl download error:', error);
        Taro.showToast({
          icon: 'none',
          title: '获取失败，请使用相册'
        })
      }
    } else {
      //用户按了拒绝按钮
    }
  }

  onCut = (cutImageSrc) => {
    this.ageMap.origin = cutImageSrc
    console.log('this.ageMap :', this.ageMap);
    this.setState({
      cutImageSrc,
      originSrc: ''
    }, () => {
      this.onAnalyzeFace(cutImageSrc)
      
    })
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
      const uploadFile =  promisify(Taro.cloud.uploadFile)
      const { fileID } = await uploadFile(uploadParams)
      return fileID
      
    } catch (error) {
      console.log('error :', error)
      return ''
    }

  }

  cloudCanvasToAnalyzeH5 = async (tempFilePaths) => {

    // console.log('tempFilePaths :', tempFilePaths);

    let oldTime = Date.now()
    const couldRes = await cloudCallFunction({
      name: 'analyze-face',
      data: {
        base64Main: getBase64Main(tempFilePaths)
      }
    })

    console.log(((Date.now() - oldTime) / 1000).toFixed(1) + '秒')

    console.log('couldRes :', couldRes);
    return couldRes
  }

  cloudCanvasToAnalyze = async (tempFilePaths) => {

    const resImage = await Taro.compressImage({
      src: tempFilePaths, // 图片路径
      quality: 10 // 压缩质量
    })

    let oldTime = Date.now()

    console.log('resImage :', resImage);

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

    console.log(((Date.now() - oldTime) / 1000).toFixed(1) + '秒')

    return couldRes
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
      let shapeList = getHatShapeList(hatList, DPR_CANVAS_SIZE, ORIGiN_SHAPE_SIZE)

      setTmpThis(this, shapeList[0])

      this.setState({
        currentShapeIndex: 0,
        shapeList,
        isShowShape: true,
      })

      Taro.hideLoading()

      // 测试大小的代码，没有用
      // console.log('cutImageSrc :', cutImageSrc);
      // const { data: base64Main } = await fsmReadFile({
      //   filePath: cutImageSrc,
      //   // encoding: 'utf-8', //'base64',
      // })
      // const base64 = wx.arrayBufferToBase64(base64Main)
      // // 以0.657M的图片为例
      // // 转换为ArrayBuffer，大小还是0.657M
      // // 转换为base64，大小为1.7M
      // // 转换为utf-8，大小为1.2M
      // console.log('base64Main :', base64Main.byteLength)
      // console.log('base64 :', base64);
      // console.log('变大率 :', base64.length, base64.length / (base64Main.byteLength))

      this.uploadOriginImage(cutImageSrc)


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
      setTmpThis(this, shapeList[0])
      this.uploadOriginImage(cutImageSrc)
    }
  }

  uploadOriginImage = async (cutImageSrc) => {
    if (!isH5Page) {
      const fileID = await this.onUploadFile(cutImageSrc)
      console.log('fileID :', fileID);
      this.setState({
        originFileID: fileID
      })
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
    this.ageMap = getDefaultAgeMap()

    this.setState({
      shapeList: [
        getDefaultShape()
      ],
      currentAgeType: 'origin',
      cutImageSrc: '',
      originFileID: '',
      shareUUID: ''
    })
  }

  generateImage = async () => {
    
    this.setState({
      posterSrc: '',
    })
    
    try {
      Taro.showModal({
        title: '提示',
        content: '图片会上传到云端，便于分享和下次查看，请确定？',
        success: (res) => {
          if (res.confirm) {
            Taro.showLoading({
              title: '图片生成中'
            })
            this.drawCanvas()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
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



  // TODO 这个也可以分离？
  drawCanvas = async () => {
    const {
      shapeList,
      cutImageSrc
    } = this.state

    const pc = Taro.createCanvasContext('canvasShape')

    pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH);
    let tmpCutImage = await getImg(cutImageSrc)
    pc.drawImage(tmpCutImage, 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)

    for (let index = 0; index < shapeList.length; index++) {
      const shape = shapeList[index];
      pc.save()
      const {
        categoryName,
        shapeWidth,
        rotate,
        shapeCenterX,
        shapeCenterY,
        currentShapeId,
        reserve,
      } = shape
      const shapeSize = shapeWidth * pixelRatio
  
      pc.translate(shapeCenterX * pixelRatio, shapeCenterY * pixelRatio);
      pc.rotate((rotate * Math.PI) / 180)

      let oneMaskSrc = require(`../../images/${categoryName}-${currentShapeId}${reserve < 0 ? '-reverse' : ''}.png`)
      let oneImgSrc = isH5Page ? await getImg(oneMaskSrc) : oneMaskSrc
  
      pc.drawImage(
        oneImgSrc,
        -shapeSize / 2,
        -shapeSize / 2,
        shapeSize,
        shapeSize
      )
      pc.restore()
    }

    pc.draw(true, () => {
      Taro.canvasToTempFilePath({
        canvasId: 'canvasShape',
        x: 0,
        y: 0,
        height: DPR_CANVAS_SIZE * 3,
        width: DPR_CANVAS_SIZE * 3,
        fileType: 'jpg',
        quality: 0.9,
        success: async (res) => {
          await this.onSaveImageToCloud(res.tempFilePath)

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
    })
  }

  onSaveImageToCloud = async (tempFilePath) => {
    const { currentAgeType } = this.state

    try {
      // 上传头像图片
      const fileID = await this.onUploadFile(tempFilePath, 'avatar')
      console.log('上传头像图片 fileID :', fileID);
  
      const { uuid } = await cloudCallFunction({
        name: 'collection_add_one',
        data: {
          collection_name: 'avatars',
          info: {
            avatar_fileID: fileID,
            age_type: currentAgeType
          }
        }
      })
      console.log('addRes uuid:', uuid);

      this.setState({
        shareUUID: uuid
      })
      
    } catch (error) {
      console.log('error :', error);
    }



  }



  chooseShape = (shapeId, categoryName) => {
    let { shapeList, currentShapeIndex } = this.state
    console.log('categoryName :', categoryName);

    if (shapeList.length > 0 && currentShapeIndex >= 0) {
      shapeList[currentShapeIndex] = {
        ...shapeList[currentShapeIndex],
        categoryName,
        currentShapeId: shapeId
      }
    } else {
      currentShapeIndex = shapeList.length
      shapeList.push({
        ...getDefaultShape(categoryName),
        currentShapeId: shapeId
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

  reverseShape = (e) => {
    const { shapeIndex = 0 } = e.target.dataset
    const { shapeList } = this.state
    shapeList[shapeIndex] = {
      ...shapeList[shapeIndex],
      reserve: 0 - shapeList[shapeIndex].reserve
    }

    this.setState({
      shapeList
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
    if (this.touch_target == 'shape' && shapeIndex !== this.state.currentShapeIndex) {
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
      shapeCenterX,
      shapeCenterY,
      resizeCenterX,
      resizeCenterY,
    } = shapeList[this.touch_shape_index]

    var current_x = e.touches[0].clientX;
    var current_y = e.touches[0].clientY;
    var moved_x = current_x - this.start_x;
    var moved_y = current_y - this.start_y;
    if (this.touch_target == 'shape') {
      shapeList[this.touch_shape_index] = {
        ...shapeList[this.touch_shape_index],
        shapeCenterX: shapeCenterX + moved_x,
        shapeCenterY: shapeCenterY + moved_y,
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

      let diff_x_before = this.resize_center_x - this.shape_center_x;
      let diff_y_before = this.resize_center_y - this.shape_center_y;
      let diff_x_after = resizeCenterX - this.shape_center_x;
      let diff_y_after = resizeCenterY - this.shape_center_y;
      let distance_before = Math.sqrt(
        diff_x_before * diff_x_before + diff_y_before * diff_y_before
      );

      let distance_after = Math.sqrt(
        diff_x_after * diff_x_after + diff_y_after * diff_y_after
      );

      let angle_before = (Math.atan2(diff_y_before, diff_x_before) / Math.PI) * 180;
      let angle_after = (Math.atan2(diff_y_after, diff_x_after) / Math.PI) * 180;

      let twoState = {
        shapeWidth: (distance_after / distance_before) * this.shape_width,
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

  goTestHat = () => {
    Taro.navigateTo({
      url: '/pages/test/test'
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

  previewPoster = () => {
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

  saveImageToPhotosAlbum = (tempFilePath) => {
    if (isH5Page) {
      downloadImgByBase64(tempFilePath)
    } else {
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
      })
    }
  }

  changeAge = async (type) => {
    const { originFileID } = this.state
    const { origin: cutImageSrc } = this.ageMap

    if (this.ageMap[type]) {
      this.setState({
        currentAgeType: type,
        cutImageSrc: this.ageMap[type]
      })
      return
    }

    if (!cutImageSrc) return

    Taro.showLoading({
      title: '绘制中，请稍后....'
    })

    this.styleReq = true

    try {

      let oldTime = Date.now()

      const couldRes = await cloudCallFunction({
        name: 'face-transformation',
        data: {
          fileID: originFileID,
          AgeInfos: [
            {
              Age: 10,
            },
            {
              Age: 10,
            },
            {
              Age: 10,
            },
          ]
          // type
        }
      })

      this.styleReq = false

      console.log('图片转换花费时间', ((Date.now() - oldTime) / 1000).toFixed(1) + '秒')

      console.log('图片分析结果 :', couldRes)

      let cutImageSrcNow = 'data:image/jpg;base64,' + couldRes.base64Main

      // let cutImageSrcNow = await base64src('data:image/jpg;base64,' + couldRes.base64Main)

      console.log('cutImageSrcNow :', cutImageSrcNow);

      this.ageMap[type] = cutImageSrcNow
      this.setState({
        currentAgeType: type,
        cutImageSrc: cutImageSrcNow,
      })

      Taro.hideLoading()

    } catch (error) {
      console.log('changeAge error :', error);

      Taro.hideLoading()
      this.styleReq = false
    }
  }



  renderPoster = () => {
    const { posterSrc, isShowPoster } = this.state
    return (
      <View className={`poster-dialog ${isShowPoster ? 'show' : ''}`}>
        <View className='poster-dialog-main'>
          {!!posterSrc && <Image className='poster-image' src={posterSrc} onClick={this.previewPoster} showMenuByLongpress></Image>}
          <View className='poster-image-tips'>点击可预览大图，长按可分享图片</View>
          <View className='poster-dialog-close' onClick={this.onHidePoster} />
          <View className='poster-footer-btn'>
            <View className='poster-btn-save' onClick={this.savePoster}>
              <Image
                className='icon'
                src='https://n1image.hjfile.cn/res7/2019/01/03/740198f541ce91859ed060882d986e09.png'
              />
              保存到相册
            </View>
            {!isH5Page && (
              <Button className='poster-btn-share' openType='share' data-poster-src={posterSrc}>
                <Image
                  className='icon-wechat'
                  src='https://n1image.hjfile.cn/res7/2019/03/20/21af29d7755905b08d9f517223df5314.png'
                />
                分享给朋友
              </Button>
            )}
          </View>
        </View>

      </View>
    )
  }

  render() {
    const {
      originSrc,
      cutImageSrc,
      isShowShape,
      currentTabIndex,
      currentJiayouId,
      shapeList,
      currentShapeIndex,
      currentAgeType,
    } = this.state


    let tabsTips = (currentShapeIndex >= 0 ? '点击更换' : '点击新增') + materialList[currentTabIndex].cn

    return (
      <View className='shape-page'>
        {isH5Page && !cutImageSrc && <View className="header-bar">女神戴皇冠</View>}
        <Canvas className='canvas-shape' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_WIDTH + 'px' }} canvasId='canvasShape' ref={c => this.canvasShapeRef = c} />
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
                    isShowShape && shapeList.map((shape, shapeIndex) => {

                      const {
                        categoryName,
                        shapeWidth,
                        currentShapeId,
                        timeNow,
                        shapeCenterX,
                        shapeCenterY,
                        resizeCenterX,
                        resizeCenterY,
                        reserve,
                        rotate
                      } = shape

                      let transX = shapeCenterX - shapeWidth / 2 - 2 + 'px'
                      let transY = shapeCenterY - shapeWidth / 2 - 2 + 'px'

                      let shapeStyle = {
                        width: shapeWidth + 'px',
                        height: shapeWidth + 'px',
                        transform: `translate(${transX}, ${transY}) rotate(${rotate + 'deg'})`,
                        zIndex: shapeIndex === currentShapeIndex ? 2 : 1
                      }

                      let shapeImageStyle = {
                        transform: `scale(${reserve}, 1)`,
                      }

                      // let handleStyle = {
                      //   top: resizeCenterY - 10 + 'px',
                      //   left: resizeCenterX - 10 + 'px'
                      // }

                      return (
                        <View className='shape-container' key={timeNow} style={shapeStyle}>
                          <Image className="shape" data-type='shape' data-shape-index={shapeIndex} src={require(`../../images/${categoryName}-${currentShapeId}.png`)} style={shapeImageStyle} />
                          {
                            currentShapeIndex === shapeIndex && (
                              <Block>
                                <View className='image-btn-remove' data-shape-index={shapeIndex} onClick={this.removeShape}></View>
                                <View className='image-btn-resize' data-shape-index={shapeIndex} data-type='rotate-resize'></View>
                                <View className='image-btn-reverse' data-shape-index={shapeIndex} onClick={this.reverseShape}></View>
                                <View className='image-btn-checked' data-shape-index={shapeIndex} onClick={this.checkedShape}></View>
                              </Block>
                            )
                          }
                        </View>
                      )
                    })
                  }
                  {/* {
                    isShowShape && currentJiayouId > 0 && (
                      <View className="image-jiayou">
                        <Image id='shape' src={require(`../../images/jiayou-${currentJiayouId}.png`)} />
                        <View className='image-btn-jiayou' onClick={this.chooseJiayouId}></View>
                      </View>
                    )
                  } */}
                </View>
              )
              : (
                <View className='to-choose' data-way="album" onClick={this.onChooseImage.bind(this, 'album')}></View>
              )
            }
          </View>
          {cutImageSrc
            ? (
              <View className='button-wrap'>
                <View className='button-remove' onClick={this.onRemoveImage}>
                  移除图片
                </View>
                <View className='button-download' onClick={this.generateImage}>
                  保存图片
                </View>
              </View>
            )
            : (
              <View className='button-wrap'>
                <View className="buttom-tips">更多选择</View>
                {
                  !isH5Page && <Button className="button-avatar" type="default" data-way="avatar" openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>使用头像</Button>
                }
                <Button className='button-camera' type="default" data-way="camera" onClick={this.onChooseImage.bind(this, 'camera')}>
                  使用相机
                </Button>
              </View>
            )

          }
        </View>
        

        {!isH5Page && !!cutImageSrc && (
          <View className='style-list-wrap'>
            {
              dataStyleList.map(item => {
                const { type, text, image } = item
                return (
                  <View className={`style-item ${currentAgeType === type ? 'style-item-active' : ''}`} key={type} onClick={this.changeAge.bind(this, type)}>
                    <Image className='style-item-image' src={image} />
                    <View className='style-item-text'>{text}</View>
                  </View>
                )
              })
            }
          </View>
        )}
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
                          {item.cn}
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
                          <ScrollView className="shape-select-wrap" scrollX>
                            {
                              item.imgList.map((imgId) => {
                                return (
                                  <Image
                                    className={`tab-bd-image  tab-bd-image-${item.name}`}
                                    key={imgId}
                                    src={require(`../../images/${item.name}-${imgId}.png`)}
                                    onClick={() => {
                                      if (item.name === 'crown' || item.name === 'text') this.chooseShape(imgId, item.name)
                                      if (item.name === 'jiayou') this.chooseJiayouId(imgId)

                                    }}
                                    data-shape-id={imgId}
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
                  {'备注：\n选择后会识别图中人脸，并自动戴上皇冠\n识别过程需几秒钟，请耐心等待'}
                </Text>
              </View>
            )
        }

        {!originSrc && (
          <Block>
            <View className='test-hat-btn' onClick={this.goTestHat}>圣诞帽测试</View>
            <Button className='share-btn' openType='share' onClick={this.showH5Modal}>分享给朋友<View className='share-btn-icon'></View></Button>
          </Block>
        )}
        {
          this.renderPoster()
        }

        <View className='cropper-wrap' hidden={!originSrc}>
          <TaroCropper
            src={originSrc}
            cropperWidth={ORIGIN_CANVAS_SIZE * 2}
            cropperHeight={ORIGIN_CANVAS_SIZE * 2}
            ref={this.catTaroCropper}
            fullScreen
            fullScreenCss
            onCut={this.onCut}
            hideCancelText={false}
            onCancel={this.onCancel}
          />
        </View>

      </View>
    )
  }
}

export default QueenKing