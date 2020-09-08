import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, Canvas, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
import { base64src, downloadImgByBase64, getImg } from 'utils/image-utils'
import { SAVE_IMAGE_WIDTH, SAVE_IMAGE_HEIGHT, DPR_CANVAS_SIZE, SAVE_CODE_SIZE, SAVE_PAGE_DPR, STATUS_BAR_HEIGHT, SAVE_AVATAR_SIZE, POSTER_WIDTH, POSTER_HEIGHT } from './utils'
import { drawRoundImage, fillText, toDrawRadiusRect } from 'utils/canvas'
import CorePage from 'page';

import './styles.styl'

const isH5Page = process.env.TARO_ENV === 'h5'

@CorePage
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

    let imageUrl = avatarFileID || DEFAULT_SHARE_COVER

    let typeMap = {
      origin: '邀请好友一起来制作头像吧',
      childhood: '换个头像，一起回归童真'
    }

    if (from === 'button') {
      const { dataset: { posterSrc } } = target
      imageUrl = posterSrc
      this.onSaveImage(imageUrl)
    }

    return {
      title: typeMap[ageType] || typeMap.origin,
      imageUrl,
      path: this.pageUrl
    }
  }

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

  onSaveImage = async (imgSrc) => {
    const { avatarFileLocal } = this.state
    this.saveImageToPhotosAlbum(imgSrc || avatarFileLocal)
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

  /**
 * 获取图片
 * @param {*} src 图片地址
 * @param {*} callback
 */
  getImgAvatar = async (src) => {

    try {
      const img = await getImg(src)
      return img
    } catch (error) {
      return require('../../images/avatar-logo.png')

    }
  }

  onCreatePoster = async () => {
    const { userInfo } = this.props
    console.log('userInfo :>> ', userInfo);
    const { wechatInfo } = userInfo
    const { nickName, avatarUrl } = wechatInfo
    
    try {
      
      Taro.showLoading({
        title: '绘制中...'
      })
      const {
        avatarFileLocal,
        qrcodeFile
      } = this.state
      
  
      const posterCtx = Taro.createCanvasContext('canvasPoster')

  
      posterCtx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
      if (!avatarFileLocal) {
        return Error('需要重新进入页面')
      }
      posterCtx.drawImage(require('../../images/poster-bg.jpg'), 0, 0, POSTER_WIDTH, POSTER_HEIGHT)
      if (avatarUrl) {
        let avatarNow = await this.getImgAvatar(avatarUrl)
        posterCtx.drawImage(avatarNow, 40, 40, 120, 120)
        // drawRoundImage(posterCtx, avatarNow, 40, 40, 60) // 有黑圈问题
      }
      posterCtx.drawImage(avatarFileLocal, 40, 184, SAVE_AVATAR_SIZE, SAVE_AVATAR_SIZE)
      posterCtx.drawImage(require('../../images/logo-text.png'), 40, 880, 250, 108)
      if (qrcodeFile) {
        drawRoundImage(posterCtx, qrcodeFile, 440, 820, 100)
      }
      fillText(posterCtx, nickName, 184, 110, false, 32, '#333')
      
  
      posterCtx.draw(true, () => {
        Taro.canvasToTempFilePath({
          canvasId: 'canvasPoster',
          x: 0,
          y: 0,
          height: POSTER_HEIGHT,
          width: POSTER_WIDTH,
          fileType: 'jpg',
          quality: 0.9,
          success: async (res) => {

  
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
          <View className='poster-image-wrap'>
            {!!posterSrc && <Image className='poster-image' src={posterSrc} showMenuByLongpress></Image>}
            {/* <View className='poster-image-tips'>长按可分享图片</View> */}
            <View className='poster-dialog-close' onClick={this.onHidePoster} />
          </View>
          <View className='poster-footer-btn'>
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
        <Canvas className='canvas-poster' style={{ width: POSTER_WIDTH + 'px', height: POSTER_HEIGHT + 'px' }} canvasId='canvasPoster' ref={c => this.canvasPosterRef = c} />
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