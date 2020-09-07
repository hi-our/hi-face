import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Canvas, Block } from '@tarojs/components'
import { STATUS_BAR_HEIGHT, SAVE_IMAGE_WIDTH, getDefaultState } from './utils'
import PageLoading from 'components/page-status'
import ShapeEdit from './components/shape-edit'
import TabCategoryList from './components/tab-category-list'
import PosterDialog from './components/poster-dialog'
import { getHatInfo, getHatShapeList } from 'utils/face-utils'
import { getImg, fsmReadFile, getBase64Main } from 'utils/canvas-drawing'
import { h5PageModalTips } from 'utils/common'
import { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'
import { imgSecCheck } from 'utils/image-safe-check';
import { imageAnalyzeFace } from 'utils/image-analyze-face'
import CustomTabBar from 'components/custom-tab-bar'
import MenuMain from './components/menu-main'
import MenuChoose from './components/menu-choose'
import EventEmitter from 'utils/event-emitter'
import PageLead from './components/page-lead'


import './styles.styl'

const isH5Page = process.env.TARO_ENV === 'h5'
const isQQPage = process.env.TARO_ENV === 'qq'


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
  
  // componentDidMount() {
  //   if (isH5Page) {
  //     setTimeout(() => {
  //       this.loadData() 
  //     }, 1500);
  //   } else {
  //     this.loadData()
  //   }
  // }

  componentDidShow() {
    this.showH5Modal()
    const themeIdData = EventEmitter.take('themeId')
    if (themeIdData && themeIdData[0] !== this.state.themeData._id) {
      this.setState(getDefaultState())
      this.loadData(themeIdData[0])
    } else if (this.state.pageStatus === 'loading') {
      this.loadData()
    }

    this.setState({
      tabBarIndex: 1
    })
  }
  componentDidHide() {
    this.setState({
      tabBarIndex: -1
    })
  }

  onShareAppMessage({ from, target }) {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'
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

  loadData = async (themeId = '') => {
    try {
      const themeData = await cloudCallFunction({
        name: 'api',
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
    })
  }



  onSaveImageToCloud = async (tempFilePath) => {
    const { currentAgeType, themeData } = this.state
    const { _id: themeId, themeName } = themeData

    try {
      // 上传头像图片
      const fileID = await this.onUploadFile(tempFilePath, 'avatar')

      const { uuid } = await cloudCallFunction({
        name: 'api',
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

      this.saveImageToPhotosAlbum(tempFilePath)

    } catch (error) {
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
    const { themeList } = this.props
    const { isShowShape, isShowMenuMain, cutImageSrc, shapeList, pageStatus, themeData, shapeCategoryList, tabBarIndex, posterSrc } = this.state
    const { coverImageUrl, _id: activeThemeId } = themeData

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
                <Block>
                  <Image src={coverImageUrl} className="page-cover" />
                </Block>
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
          <View className={`menu-toggle ${isShowMenuMain ? 'menu-open' : ''}`} onClick={this.onMenuMainTogggle} style={{ marginTop: STATUS_BAR_HEIGHT + 'px' }}></View>
        </View>
        {isH5Page && (
          <PosterDialog
            isH5Page={isH5Page}
            ref={poster => this.posterRef = poster}
            posterSrc={posterSrc}
            forCheck={false}
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