import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Canvas } from '@tarojs/components'
import { STATUS_BAR_HEIGHT, SAVE_IMAGE_WIDTH, getDefaultState, getOneShapeList } from './utils'
import PageLoading from 'components/page-status'
import ShapeEdit from './components/shape-edit'
import TabCategoryList from './components/tab-category-list'
import PosterDialog from './components/poster-dialog'
import { getHatList, getHatShapeList } from 'utils/face-utils'
import { getImg, fsmReadFile, getBase64Main, saveImageToPhotosAlbum, onUploadFile } from 'utils/image-utils'
import { h5PageModalTips, imageThumb } from 'utils/common'
import { cloudCallFunction } from 'utils/fetch'
import { imgSecCheck } from 'utils/image-safe-check';
import { imageAnalyzeFace } from 'utils/image-analyze-face'
import CustomTabBar from 'components/custom-tab-bar'
import MenuMain from './components/menu-main'
import MenuChoose from './components/menu-choose'
import EventEmitter from 'utils/event-emitter'
import PageLead from './components/page-lead'


import './styles.styl'

const isH5Page = process.env.TARO_ENV === 'h5'

@connect(state => ({
  forCheck: state.global.forCheck,
  themeList: state.global.themeList
}), null)
class AvatarEdit extends Component {
  config = {
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '头像编辑 - Hi头像',
    navigationStyle: 'custom',
    disableScroll: true,
  }

  constructor(props) {
    super(props)
    this.state = getDefaultState()
  }

  componentWillMount() {
    Taro.setStorageSync('showBackToIndexBtn', false)
  }
  
  // 页面显示
  componentDidShow() {
    // 显示 Web 端提示
    this.showTimer = setTimeout(() => {
      // this.showH5Modal()
    }, 2500)

    // 显示当前高亮 Tab
    this.setState({
      tabBarIndex: 1
    })

    // 加载主题数据
    const themeIdData = EventEmitter.take('themeId')
    if (themeIdData && themeIdData[0] !== this.state.themeData._id) {
      this.setState(getDefaultState())
      this.loadData(themeIdData[0])
    } else if (this.state.pageStatus === 'loading') {
      this.loadData()
    }
  }

  // 页面隐藏
  componentDidHide() {
    clearTimeout(this.showTimer)
    this.setState({
      tabBarIndex: -1
    })
  }

  // 分享信息
  onShareAppMessage({ from, target }) {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/img/20200908/20f5ceab078c93d0901ea0ab0aac8b27-1231fe.jpg'
    const { themeData } = this.state
    let { shareImage = DEFAULT_SHARE_COVER, shareTitle = '给女神戴上皇冠吧！' } = themeData

    let shareUrl = '/pages/avatar-edit/avatar-edit'
    if (from === 'button') {
      const { dataset = {} } = target
      const { posterSrc = '' } = dataset

      if (posterSrc) {
        shareImage = posterSrc
        const { shareUUID } = this.state
        if (shareUUID) {
          shareUrl = `/pages/avatar-poster/avatar-poster?uuid=${shareUUID}`
        }
      }

    }

    return {
      title: shareTitle,
      imageUrl: shareImage,
      path: shareUrl
    }
  }

  // 获取数据
  loadData = async (themeId = '') => {
    try {
      const themeData = await cloudCallFunction({
        name: 'hiface-api',
        data: {
          $url: 'theme/get',
          needShapes: true,
          themeId
        }
      })

      const { shapeCategoryList } = themeData
      
      this.setState({
        pageStatus: 'done',
        themeData,
        shapeCategoryList,
      })
      
    } catch (error) {
      console.log('error :>> ', error);
      this.setState({
        pageStatus: 'error',
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
      this.onAnalyzeFace(cutImageSrc)
    })
  }

  onAnalyzeFace = async (cutImageSrc) => {
    if (!cutImageSrc) return

    const { shapeCategoryList = [] } = this.state
    const { shapeList: shapeListRes } = shapeCategoryList[0]
    const shapeOne = shapeListRes[0]

    Taro.showLoading({
      title: '识别中...'
    })

    this.setState({
      isShowShape: false,
    })

    try {
      let shapeList = []
      // web版用老逻辑
      if (shapeOne.position === 2 || isH5Page) {
        let cloudFunc = isH5Page ? this.cloudAnalyzeFaceH5 : this.cloudAnalyzeFaceWx
  
        const couldRes = await cloudFunc(cutImageSrc)
  
        Taro.hideLoading()
  
        console.log('图片分析的结果 :', couldRes)
        // 开启人脸识别开关后
        if (!couldRes.FaceShapeSet) {
          this.setState({
            shapeList,
            isShowShape: true
          })
          return
        }
        const hatList = getHatList(couldRes, shapeOne)
        shapeList = getHatShapeList(hatList, shapeOne, SAVE_IMAGE_WIDTH)
  
        this.setState({
          shapeList,
          isShowShape: true,
        })
        return
      }


      await this.imageCheckNow(cutImageSrc)
      if (shapeOne.position) {
        shapeList = [
          getOneShapeList(shapeOne)
        ]
      }
      console.log('2 :>> ', shapeList);
      this.setState({
        shapeList,
        isShowShape: true,
      })
      Taro.hideLoading()


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

    const couldRes = forCheck ? {} : await imageAnalyzeFace(base64Main)

    return couldRes
  }

  imageCheckNow = async (tempFilePaths) => {
    const resImage = await Taro.compressImage({
      src: tempFilePaths, // 图片路径
      quality: 10 // 压缩质量
    })

    let { data: base64Main } = await fsmReadFile({
      filePath: resImage.tempFilePath,
      encoding: 'base64',
    })

    await imgSecCheck(base64Main)
  }

  onRemoveImage = () => {

    this.setState({
      cutImageSrc: '',
      isShowShape: false,
      shareUUID: ''
    })
  }

  onGenerateImage  = async () => {
    this.setState({
      posterSrc: '',
    })

    Taro.showLoading({
      title: '图片生成中'
    })
    this.drawCanvas()
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

      // 获取图形地址 解决web版跨域 ?skip_domain_check=true
      let imageUrlTemp = isReserve < 0 ? (imageReverseUrl || imageUrl) : imageUrl
      imageUrlTemp = imageUrlTemp + (imageUrlTemp.includes('tcb.qcloud.la') ? '?skip_domain_check=true' : '')
      let oneImgSrc = await getImg(imageUrlTemp + (imageUrlTemp.includes('tcb.qcloud.la') ? '?skip_domain_check=true' : ''))

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

    pc.draw(true, () => {
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
          if (!isH5Page) {
            saveImageToPhotosAlbum(res.tempFilePath)
            await this.onSaveImageToCloud(res.tempFilePath)
          }

          Taro.hideLoading()
          // 设置海报图片
          this.setState({
            posterSrc: res.tempFilePath
          })

        },
        fail: (e) => {
          console.log('e :>> ', e);
          Taro.hideLoading()
          Taro.showToast({
            title: '图片生成失败，请重试'
          })
        }
      })
    })
  }

  onSaveImageToCloud = async (tempFilePath) => {
    const { currentAgeType, themeData } = this.state
    const { _id: themeId, themeName } = themeData

    try {
      // 上传头像图片
      const fileID = await onUploadFile(tempFilePath, 'avatar')

      const { uuid } = await cloudCallFunction({
        name: 'hiface-api',
        data: {
          $url: 'avatar/save',
          avatarFileID: fileID,
          ageType: currentAgeType,
          themeId,
          themeName
        }
      })

      this.setState({
        shareUUID: uuid
      })

      Taro.navigateTo({
        url: `/pages/avatar-poster/avatar-poster?uuid=${uuid}`
      })

    } catch (error) {
      console.log('error :', error);
    }
  }

  chooseShape = (shape) => {
    if (this.shapeEditRef) {
      this.shapeEditRef.chooseShape(shape)
    }
  }

  onMenuMainTogggle = () => {
    this.setState({
      isShowMenuMain: !this.state.isShowMenuMain
    })
  }

  onSwitchTheme = (themeId) => {
    this.setState(getDefaultState())
    this.loadData(themeId)
  }

  render() {
    const { themeList, forCheck } = this.props
    const { isShowShape, isShowMenuMain, cutImageSrc, shapeList, pageStatus, themeData, shapeCategoryList, tabBarIndex, posterSrc } = this.state
    const { coverImageUrl, _id: activeThemeId, themeName } = themeData

    console.log('coverImageUrl :>> ', coverImageUrl);
    return (
      <View className={`avatar-edit-page ${isShowMenuMain ? 'menu-open' : ''}`}>
        {/* <PageLead /> */}
        <PageLoading status={pageStatus} loadingType='fullscreen'></PageLoading>
        <Canvas className='canvas-shape' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_WIDTH + 'px' }} canvasId='canvasShape' ref={c => this.canvasShapeRef = c} />
        <View className={`page-container ${isShowShape ? 'page-container-shape' : ''}`} style={{ paddingTop: STATUS_BAR_HEIGHT + 'px' }}>
          <View className='main-wrap'>
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
                <View className="page-cover-wrap">
                  {!!coverImageUrl && <Image src={imageThumb(coverImageUrl, 600, 600, 1, 'webp')} webp className="page-theme-cover" />}
                  <View className='page-theme-name'>{themeName}</View>
                </View>
              )
            }
            <View className={`tabs-bottom ${pageStatus === 'done' && isShowShape ? 'tabs-open' : ''}`} >
              <TabCategoryList
                categoryList={shapeCategoryList}
                chooseShape={this.chooseShape}
              />
            </View>
          </View>
          <MenuChoose isMenuShow={tabBarIndex === 1 && !isShowShape} onChoose={this.onChoose} />
          <CustomTabBar selected={tabBarIndex} hideIndex={tabBarIndex === 1 && !isShowShape ? 1 : -1} />
          <View className='menu-toggle' onClick={this.onMenuMainTogggle} style={{ marginTop: STATUS_BAR_HEIGHT + 'px' }}></View>
        </View>
        {isH5Page && (
          <PosterDialog
            isH5Page={isH5Page}
            ref={poster => this.posterRef = poster}
            posterSrc={posterSrc}
            forCheck={forCheck}
          />
        )}
        <MenuMain
          activeThemeId={activeThemeId}
          isShowMenuMain={isShowMenuMain}
          themeList={themeList}
          onMenuMainTogggle={this.onMenuMainTogggle}
          onSwitchTheme={this.onSwitchTheme}
        />
      </View>
    )
  }
}

export default AvatarEdit