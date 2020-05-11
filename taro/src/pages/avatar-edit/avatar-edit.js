import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'
import { STATUS_BAR_HEIGHT, SAVE_IMAGE_WIDTH, getDefaultShape, dataStyleList } from './utils'
import PageWrapper from 'components/page-wrapper'
import ImageChoose from './components/image-choose'
import ShapeEdit from './components/shape-edit'
import TabCategoryList from './components/tab-category-list'
import { getHatInfo, getHatShapeList } from 'utils/face-utils'
import { getImg, fsmReadFile, srcToBase64Main, getBase64Main, downloadImgByBase64 } from 'utils/canvas-drawing'
import { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'

import './styles.styl'

const isH5Page = process.env.TARO_ENV === 'h5'
const isQQPage = process.env.TARO_ENV === 'qq'

const pageConfigName = 'avatar-edit'

@connect(state => ({
  pageConfig: state.global[pageConfigName]
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
      errorText: '',
      shapeCategoryList: [],
      cutImageSrc: '',
      isShowShape: false,
      posterSrc: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    const { pageConfig: prevConfig } = this.props
    const { pageConfig: nextConfig } = nextProps

    if (prevConfig !== nextConfig) {
      console.log('1 :>> ', 1)
      
      const { themeId } = nextConfig
      this.loadData(themeId)
    }
  }

  loadData = async (themeId) => {
    try {
      const themeData = await cloudCallFunction({
        name: 'collection_get_theme_data',
        data: {
          themeId: themeId
        }
      })

      const { shapeCategoryList } = themeData
      this.setState({
        pageStatus: 'done',
        themeData,
        shapeCategoryList
      })
      
    } catch (error) {
      console.log('error :>> ', error);
      this.setState({
        pageStatus: 'error',
        errorText: '加载失败'
      })
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
    console.log('shapeOne :>> ', shapeOne);
    

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
      const hatList = getHatInfo(couldRes, shapeOne)
      console.log('hatList :', hatList);

      // let faceList = hatList.map(item => item.faceInfo)
      let shapeList = getHatShapeList(hatList, shapeOne, SAVE_IMAGE_WIDTH)
      console.log('shapeList :>> ', shapeList);

      // console.log('faceList :>> ', faceList);

      this.setState({
        shapeList,
        isShowShape: true,
        // faceList
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
    const { isLifeChecked } = this.state

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
            isLifeChecked ? this.drawCanvasFour() : this.drawCanvas()

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
      const shapeSize = shapeWidth

      pc.translate(shapeCenterX, shapeCenterY);
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
        height: SAVE_IMAGE_WIDTH * 3,
        width: SAVE_IMAGE_WIDTH * 3,
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
  drawCanvasFour = async () => {
    const {
      shapeList,
    } = this.state

    const pc = Taro.createCanvasContext('canvasShape')

    pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH);

    for (let yLength = 0; yLength < 2; yLength++) {
      for (let xLength = 0; xLength < 2; xLength++) {
        console.log('xLength :>> ', xLength, yLength);
        let type = dataStyleList[(xLength + yLength * 2)].type
        console.log('type :>> ', type);
        let tmpCutImage = await getImg(this.ageMap[type])
        let xLengthPos = xLength * SAVE_IMAGE_WIDTH / 2
        let yLengthPos = yLength * SAVE_IMAGE_WIDTH / 2
        pc.drawImage(tmpCutImage, xLengthPos, yLengthPos, SAVE_IMAGE_WIDTH / 2, SAVE_IMAGE_WIDTH / 2)

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
          const shapeSize = shapeWidth / 2

          pc.translate(shapeCenterX / 2 + xLengthPos, shapeCenterY / 2 + yLengthPos);
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
      }

    }

    pc.draw(true, () => {
      Taro.canvasToTempFilePath({
        canvasId: 'canvasShape',
        x: 0,
        y: 0,
        height: SAVE_IMAGE_WIDTH * 3,
        width: SAVE_IMAGE_WIDTH * 3,
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
      this.shapeEditRef.chooseShape(shape)
    }
    console.log('shape :>> ', shape);
  }



  render() {
    const { isShowShape, cutImageSrc, shapeList, pageStatus, themeData, shapeCategoryList } = this.state
    const { themeName, shareImage } = themeData
    return (
      <Block>
        <Canvas className='canvas-shape' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_WIDTH + 'px' }} canvasId='canvasShape' ref={c => this.canvasShapeRef = c} />
        <View className='avatar-edit-page' style={{ paddingTop: STATUS_BAR_HEIGHT + 'px' }}>
          <View className='main-wrap'>
            <View className='page-title'>
              {!!shareImage && <Image className='page-title-icon' src={shareImage} />}
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
                />
              )
            }
          </View>
          <View style={{ display: pageStatus === 'done' && isShowShape  ? 'block' : 'none' }}>
            <TabCategoryList
              categoryList={shapeCategoryList}
              chooseShape={this.chooseShape}
            />
          </View>
        </View>
      </Block>
    )
  }
}