import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'
import { STATUS_BAR_HEIGHT, SAVE_IMAGE_WIDTH, getDefaultShape, dataStyleList } from './utils'
import PageLoading from 'components/page-status'
import ImageChoose from './components/image-choose'
import ShapeEdit from './components/shape-edit'
import TabCategoryList from './components/tab-category-list'
import PosterDialog from './components/poster-dialog'
import { getHatInfo, getHatShapeList } from 'utils/face-utils'
import { getImg, fsmReadFile, srcToBase64Main, getBase64Main, downloadImgByBase64 } from 'utils/canvas-drawing'
import { h5PageModalTips } from 'utils/common'
import { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'
import { imgSecCheck, getResCode } from 'utils/image-safe-check';
import { imageAnalyzeFace } from 'utils/image-analyze-face'

import './styles.styl'

const isH5Page = process.env.TARO_ENV === 'h5'
const isQQPage = process.env.TARO_ENV === 'qq'


@connect(state => ({
  forCheck: state.global.forCheck
}), null)

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
      pageStatus: 'loading',
      themeData: {},
      shapeCategoryList: [],
      currentAgeType: 'origin', // 原图
      cutImageSrc: '',
      posterSrc: '',
    }
  }

  
  componentDidMount() {
    if (isH5Page) {
      setTimeout(() => {
        this.loadData() 
      }, 1500);
    } else {
      this.loadData()
    }
  }

  onShareAppMessage({ from, target }) {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'
    const { themeData } = this.state
    let { shareImage = DEFAULT_SHARE_COVER, shareTitle = '给女神戴上皇冠吧！' } = themeData

    let shareUrl = '/pages/avatar-edit/avatar-edit'
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
      title: shareTitle,
      imageUrl: shareImage,
      path: shareUrl
    }
  }

  loadData = async () => {
    try {
      const themeData = await cloudCallFunction({
        name: 'collection_get_theme_data'
      })

      console.log('themeData :>> ', themeData);

      const { shapeCategoryList, themeName } = themeData

      Taro.setTabBarItem({
        index: 0,
        text: themeName,
      })
      this.setState({
        pageStatus: 'done',
        themeData,
        shapeCategoryList,
      })
      
    } catch (error) {
      console.log('error :>> ', error);
      this.setState({
        pageStatus: 'error',
        errorText: '加载失败'
      })
    }
  }

  showH5Modal = () => {
    if (isH5Page) {
      h5PageModalTips()
    }
  }

  onChoose = (cutImageSrc) => {
    this.setState({
      cutImageSrc
    }, () => {
      console.log('cutImageSrc :>> ', cutImageSrc);
      this.onAnalyzeFace(cutImageSrc)
    })
  }

  setDafaultFace = () => {
    Taro.showToast({
      icon: 'none',
      title: '请手动添加贴纸'
    })
    this.setState({
      shapeList: [],
      isShowShape: true,
    })
  }

  onAnalyzeFace = async (cutImageSrc) => {
    if (!cutImageSrc) return

    const { shapeCategoryList = [] } = this.state
    const { shapeList: shapeListRes } = shapeCategoryList[0]
    const shapeOne = shapeListRes[0]
    console.log('shapeOne :>> ', shapeOne);
    

    Taro.showLoading({
      title: '识别中...'
    })

    this.setState({
      isShowShape: false,
    })

    try {

      let cloudFunc = isH5Page ? this.cloudAnalyzeFaceH5 : this.cloudAnalyzeFaceWx

      const couldRes = await cloudFunc(cutImageSrc)

      Taro.hideLoading()

      console.log('图片分析的结果 :', couldRes)
      // 开启人脸识别开关后
      if (!couldRes.FaceShapeSet) {
        this.setState({
          shapeList: [],
          isShowShape: true
        })
        return
      }
      const hatList = getHatInfo(couldRes, shapeOne)

      // let faceList = hatList.map(item => item.faceInfo)
      let shapeList = getHatShapeList(hatList, shapeOne, SAVE_IMAGE_WIDTH)
      console.log('shapeList :>> ', shapeList);

      // console.log('faceList :>> ', faceList);

      this.setState({
        shapeList,
        isShowShape: true,
        // faceList
      })

      // Taro.hideLoading()

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

      this.setState({
        shapeList: [],
        isShowShape: true,
      })
    }
  }

  cloudAnalyzeFaceH5 = async (tempFilePaths) => {

    const couldRes = await cloudCallFunction({
      name: 'analyze-face',
      data: {
        base64Main: getBase64Main(tempFilePaths)
      }
    })
    console.log('cloudAnalyzeFaceH5 couldRes :>> ', couldRes);
    return couldRes
  }


  cloudAnalyzeFaceWx = async (tempFilePaths) => {
    const { forCheck } = this.props

    const resImage = await Taro.compressImage({
      src: tempFilePaths, // 图片路径
      quality: 10 // 压缩质量
    })

    let { data: base64Main } = await fsmReadFile({
      filePath: resImage.tempFilePath,
      encoding: 'base64',
    })

    await imgSecCheck(base64Main)
    const couldRes = imageAnalyzeFace(base64Main)

    return couldRes
  }

  onRemoveImage = () => {
    this.cutImageSrcCanvas = ''
    // this.ageMap = getDefaultAgeMap()

    this.setState({
      // currentAgeType: 'origin',
      cutImageSrc: '',
      isShowShape: false,
      // originFileID: '',
      // isLifeChecked: false,
      shareUUID: ''
    })
  }

  onGenerateImage  = async () => {

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
    // cutImageSrc 裁剪后的头像底图
    // shapeList 图形列表
    const { cutImageSrc, shapeList } = this.state

    // 获取 canvas 的 context
    const pc = Taro.createCanvasContext('canvasShape')

    // 清空画布
    pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)

    // getImg 获取图片，注意获取图片在小程序与Web端的不同
    let tmpCutImage = await getImg(cutImageSrc)
    // 绘制裁剪后的头像底图
    pc.drawImage(tmpCutImage, 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)

    // 遍历列表，绘制图形贴纸
    for (let index = 0; index < shapeList.length; index++) {
      // 保存绘图上下文
      pc.save()

      // 获取贴纸的细节
      const {
        // 图形宽
        shapeWidth: shapeSize,
        // 旋转角度
        rotate,
        // 图形中心点 X轴
        shapeCenterX,
        // 图形中心点 Y轴
        shapeCenterY,
        // 图形正向图片地址
        imageUrl,
        // 图形反向图片地址
        imageReverseUrl,
        // 是否旋转
        reserve: isReserve,
      } = shapeList[index]

      // 移动到图形中心
      pc.translate(shapeCenterX, shapeCenterY)
      // 旋转画布角度
      pc.rotate((rotate * Math.PI) / 180)

      // 获取图形地址
      let oneImgSrc = await getImg(isReserve < 0 ? (imageReverseUrl || imageUrl) : imageUrl)

      // 绘制贴纸
      pc.drawImage(
        oneImgSrc,
        -shapeSize / 2,
        -shapeSize / 2,
        shapeSize,
        shapeSize
      )

      // 恢复之前保存的绘图上下文
      pc.restore()
    }

    pc.draw(false, () => {
      Taro.canvasToTempFilePath({
        canvasId: 'canvasShape',
        x: 0,
        y: 0,
        height: SAVE_IMAGE_WIDTH * 3,
        width: SAVE_IMAGE_WIDTH * 3,
        // 图片类型
        fileType: 'jpg',
        // 压缩质量
        quality: 0.9,
        success: async (res) => {

          // 保存图片到云数据库
          await this.onSaveImageToCloud(res.tempFilePath)

          Taro.hideLoading()
          // 设置海报图片
          this.setState({
            posterSrc: res.tempFilePath
          }, () => {
            
            // 展示海报弹窗
            this.posterRef.onShowPoster()
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
            avatarFileID: fileID,
            ageType: currentAgeType
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
      const uploadFile = promisify(Taro.cloud.uploadFile)
      const { fileID } = await uploadFile(uploadParams)
      return fileID

    } catch (error) {
      console.log('error :', error)
      return ''
    }

  }

  chooseShape = (shape) => {
    if (this.shapeEditRef) {
      console.log('shape :>> ', shape);
      this.shapeEditRef.chooseShape(shape)
    }
  }

  goTestHat = () => {
    Taro.navigateTo({
      url: '/pages/test/test'
    })
  }


  render() {
    const { forCheck } = this.props
    const { isShowShape, cutImageSrc, shapeList, pageStatus, themeData, shapeCategoryList, posterSrc } = this.state
    const { themeName, shareImage } = themeData
    console.log('pageStatus,  :>> ', pageStatus, isShowShape, shapeList, isShowShape);

    return (
      <Block>
        <PageLoading status={pageStatus} loadingType='fullscreen'></PageLoading>
        <Canvas className='canvas-shape' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_WIDTH + 'px' }} canvasId='canvasShape' ref={c => this.canvasShapeRef = c} />
        <View className='avatar-edit-page' style={{ paddingTop: STATUS_BAR_HEIGHT + 'px' }}>
          <View className='main-wrap'>
            <View className='page-title'>
              {!isH5Page && <Image className='page-title-icon' src={shareImage} />}
              {themeName || '头像编辑'}
            </View>
            {isShowShape
              ? (
                <ShapeEdit
                  cutImageSrc={cutImageSrc}
                  shapeListOut={shapeList}
                  onGenerateImage={this.onGenerateImage}
                  onRemoveImage={this.onRemoveImage}
                  ref={edit => this.shapeEditRef = edit}
                />
              )
              : (
                <ImageChoose
                  onChoose={this.onChoose}
                  isH5Page={isH5Page}
                />
              )
            }
          </View>
          <View style={{ display: pageStatus === 'done' && isShowShape  ? 'block' : 'none' }}>
            <TabCategoryList
              categoryList={shapeCategoryList}
              chooseShape={this.chooseShape}
              isH5Page={isH5Page}
            />
          </View>
        </View>
        <PosterDialog
          isH5Page={isH5Page}
          ref={poster => this.posterRef = poster}
          posterSrc={posterSrc}
          forCheck={forCheck}
        />
        {/* {!isShowShape && (
          <Block>
            <View className='test-hat-btn' onClick={this.goTestHat} style={{ top: STATUS_BAR_HEIGHT + 54 + 'px' }}>圣诞帽测试</View>
            <Button className='share-btn' openType='share' onClick={this.showH5Modal} style={{ top: STATUS_BAR_HEIGHT + 54 + 'px' }}>分享给朋友<View className='share-btn-icon'></View></Button>
          </Block>
        )} */}
      </Block>
    )
  }
}

export default AvatarEdit