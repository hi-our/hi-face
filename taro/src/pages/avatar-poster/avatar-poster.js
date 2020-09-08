import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, Canvas, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
import { base64src, downloadImgByBase64, getImg } from 'utils/image-utils'
import { SAVE_IMAGE_WIDTH, SAVE_IMAGE_HEIGHT, DPR_CANVAS_SIZE, SAVE_CODE_SIZE, SAVE_PAGE_DPR, STATUS_BAR_HEIGHT } from './utils'

import './styles.styl'

const isH5Page = process.env.TARO_ENV === 'h5'

// @CorePage
class AvatarPoster extends Component {
  config = {
    navigationBarTitleText: '头像分享 - Hi头像',
    navigationStyle: 'custom',
    disableScroll: true
  }

  constructor(props) {
    super(props)
    const { uuid = '' } = this.$router.params
    this.pageUUID = uuid
    this.pageUrl = this.pageUUID ? `/pages/avatar-poster/avatar-poster?uuid=${this.pageUUID}` : '/pages/queen-king/queen-king'
    const showBackToIndexBtn = Taro.getStorageSync('showBackToIndexBtn')
    console.log('showBackToIndexBtn :>> ', showBackToIndexBtn);
    this.state = {
      avatarFileID: '',
      avatarFileLocal: '',
      ageType: '',
      pageStatus: 'loading',
      isAuthor: false,
      showBackToIndexBtn,
      errorText: ''
    }
  }

  componentDidMount() {
    this.loadData()
    this.onCreateQrcode()
  }

  componentDidShow() {
    if (this.hasSaved) {
      this.hasSaved = false
      Taro.showToast({
        title: '已保存并分享'
      })
    }
  }

  onShareAppMessage({ from, target }) {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'

    const { avatarFileID, ageType } = this.state

    let typeMap = {
      origin: '邀请好友一起来制作头像吧',
      childhood: '换个头像，一起回归童真'
    }

    if (from === 'button') {
      this.onSaveImage()
    }

    return {
      title: typeMap[ageType] || typeMap.origin,
      imageUrl: avatarFileID || DEFAULT_SHARE_COVER,
      path: this.pageUrl
    }
  }

  // 这一页还得调试，重新想办法。base64用了以后还得删除
  onCreateQrcode = async () => {
    try {
      const { base64Main } = await cloudCallFunction({
        name: 'hiface-api',
        data: {
          $url: 'open/createMiniCode',
          path: this.pageUrl
        }
      })

      let base64Data = 'data:image/jpg;base64,' + base64Main
      const filePath = await base64src(base64Data)

      console.log('base64Main :', filePath)
      this.setState({
        qrcodeFile: filePath
      })
    } catch (error) {
      console.log('小程序码生成失败 error :', error);
    }
  }


  loadData = async () => {
    let hasError = false
    try {
      const { avatarFileID = '', ageType = '', isAuthor } = await cloudCallFunction({
        name: 'hiface-api',
        data: {
          $url: 'avatar/get',
          uuid: this.pageUUID,
        }
      })
      
      console.log('isAuthor :', avatarFileID, isAuthor);
      this.setState({
        avatarFileID,
        isAuthor,
        ageType,
      })

      if (avatarFileID) {
        let avatarFileLocal = await this.onDownloadFile(avatarFileID)
  
        console.log('avatarFileLocal :', avatarFileLocal);
        this.setState({
          avatarFileLocal
        })
      }

    } catch (error) {
      hasError = true
        // this.setState({
        //   pageStatus: 'error'
        // })
        console.log('error :', error);
    } finally {
      this.setState({
        pageStatus: hasError ? 'error' : 'done',
        errorText: hasError ? '加载失败' : ''
      })
    }
  }

  onBack = () => {
    Taro.navigateBack()
  }

  goHome = () => {
    Taro.switchTab({
      url: '/pages/avatar-edit/avatar-edit'
    })
  }

  onDownloadFile = async (fileID) => {

    let { tempFilePath } = await Taro.cloud.downloadFile({
      fileID,
    })

    return tempFilePath
    

  }

  onSaveImage = async () => {
    const { avatarFileLocal } = this.state
    this.saveImageToPhotosAlbum(avatarFileLocal)
  }

  saveImageToPhotosAlbum = (tempFilePath) => {
    console.log('tempFilePath :', tempFilePath);
    if (isH5Page) {
      downloadImgByBase64(tempFilePath)
    } else {
      Taro.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: res2 => {
          this.hasSaved = true
          Taro.showToast({
            title: '已保存并分享'
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

  onCreatePoster = async () => {
    try {
      
      Taro.showLoading({
        title: '绘制中...'
      })
      const {
        avatarFileLocal,
        qrcodeFile
      } = this.state
      
  
      const pc = Taro.createCanvasContext('canvasPoster')

  
      pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_HEIGHT);
      if (!avatarFileLocal) {
        return Error('需要重新进入页面')
      }
      console.log('avatarFileLocal :>> ', avatarFileLocal, qrcodeFile)
      // pc.drawImage(require('../../images/poster-bg.jpg'), 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH * 1.4)
      pc.drawImage(avatarFileLocal, 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)
      pc.drawImage(require('../../images/logo-text.png'), 13, 654, 300, 132)
      if (qrcodeFile) {
        pc.drawImage(qrcodeFile, 210 * SAVE_PAGE_DPR, 320 * SAVE_PAGE_DPR, SAVE_CODE_SIZE, SAVE_CODE_SIZE)
      }
      // fillText(pc, '我做了一个新头像，赞我哟', 10 * SAVE_PAGE_DPR, 360 * SAVE_PAGE_DPR, true, 30, '#3d3d3d')
      // fillText(pc, '长按识别小程序，来一起换头像吧', 10 * SAVE_PAGE_DPR, 380 * SAVE_PAGE_DPR, false, 20, '#3d3d3d')

  
      pc.draw(true, () => {
        Taro.canvasToTempFilePath({
          canvasId: 'canvasPoster',
          x: 0,
          y: 0,
          height: DPR_CANVAS_SIZE * 3,
          width: DPR_CANVAS_SIZE * 3,
          fileType: 'jpg',
          quality: 0.9,
          success: async (res) => {
            // await this.onSaveImageToCloud(res.tempFilePath)
  
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
    } catch (error) {
      console.log('error :', error);
    }
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

  renderPoster = () => {
    const { posterSrc, isShowPoster } = this.state
    return (
      <View className={`poster-dialog ${isShowPoster ? 'show' : ''}`}>
        <View className='poster-dialog-main'>
          {!!posterSrc && <Image className='poster-image' src={posterSrc} showMenuByLongpress></Image>}
          {/* <View className='poster-image-tips'>长按可分享图片</View> */}
          <View className='poster-dialog-close' onClick={this.onHidePoster} />
          <View className='poster-footer-btn'>
            {/* <View className='poster-btn-save' onClick={this.savePoster}>
              <Image
                className='icon'
                src='https://image-hosting.xiaoxili.com/img/20200812132636.png'
              />
              保存到相册
            </View> */}
            {!isH5Page && (
              <Button className='poster-btn-share' openType='share' data-poster-src={posterSrc}>
                <Image
                  className='icon-wechat'
                  src='https://image-hosting.xiaoxili.com/img/20200812132655.png'
                />
                保存并分享
              </Button>
            )}
          </View>
        </View>

      </View>
    )
  }


  render() {
    const { avatarFileID, ageType, pageStatus, isAuthor, avatarFileLocal, errorText, showBackToIndexBtn } = this.state
 
    return (
      <Block>
        <Canvas className='canvas-poster' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_HEIGHT + 'px' }} canvasId='canvasPoster' ref={c => this.canvasPosterRef = c} />
        <PageWrapper status={pageStatus} errorText={errorText}>
          <View className={`page-avatar-poster age-${ageType}`} style={{ paddingTop: STATUS_BAR_HEIGHT + 'px' }}>
            <View className='page-title'>
              {
                showBackToIndexBtn
                ? <View className='page-home' onClick={this.goHome}></View>
                : <View className='page-back' onClick={this.onBack}></View>
              }
              
              
              头像分享
            </View>
            <View className='page-poster-wrap'>
              <Image className='page-poster' src={avatarFileLocal || avatarFileID} />
            </View>
            {
              isAuthor
                ? (
                  <View className='button-wrap'>
                    <View className="button button-home" onClick={this.goHome}>再来一张</View>
                    <Button className="button button-share" openType='share'>保存并分享</Button>
                    <View className="button-poster button-fixed" onClick={this.onCreatePoster}>生成分享海报</View>
                  </View>
                )
                : (
                  <View className='button-wrap'>
                    <View className="button-try" onClick={this.goHome}>我也要玩</View>
                  </View>
                )
            }
            {/* <Version /> */}
          </View>
          {this.renderPoster()}
        </PageWrapper>
      </Block>
    )
  }
}

export default AvatarPoster