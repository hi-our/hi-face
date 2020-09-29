import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, Canvas, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
import { base64src, onDownloadFile, getImg, saveImageToPhotosAlbum } from 'utils/image-utils'
import { STATUS_BAR_HEIGHT, SAVE_AVATAR_SIZE, POSTER_WIDTH, POSTER_HEIGHT } from './utils'
import { drawRoundImage, fillText } from 'utils/canvas'
import { DEFAULT_SHARE_COVER } from 'constants/status'
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

    this.state = {
      avatarFileID: '',
      avatarFileLocal: '',
      posterBgLocal: '',
      ageType: '',
      pageStatus: 'loading',
      isAuthor: false,
      showBackToIndexBtn,
      errorText: '',
      shareTitle: '',
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

    const { avatarFileID, shareTitle } = this.state
    

    let imageUrl = avatarFileID || DEFAULT_SHARE_COVER

    let typeMap = {
      origin: '邀请好友一起来制作头像吧',
      childhood: '换个头像，一起回归童真'
    }

    if (from === 'button') {
      const { dataset: { posterSrc } } = target
      imageUrl = posterSrc
      saveImageToPhotosAlbum(imageUrl)
    }

    return {
      title: shareTitle || typeMap.origin,
      imageUrl,
      path: this.pageUrl
    }
  }

  goBack = () => {
    Taro.navigateBack()
  }

  goHome = () => {
    Taro.switchTab({
      url: '/pages/avatar-edit/avatar-edit'
    })
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
      const { avatarFileID = '', ageType = '', isAuthor, themeId } = await cloudCallFunction({
        name: 'hiface-api',
        data: {
          $url: 'avatar/get',
          uuid: this.pageUUID,
        }
      })
      
      this.setState({
        avatarFileID,
        isAuthor,
        ageType,
      })

      if (avatarFileID) {
        let avatarFileLocal = await onDownloadFile(avatarFileID)
  
        this.setState({
          avatarFileLocal
        })
      }

      if (themeId) {
        const { posterBg, shareTitle } = await cloudCallFunction({
          name: 'hiface-api',
          data: {
            $url: 'theme/get',
            themeId
          }
        })

        if (posterBg) {
          let posterBgLocal = await onDownloadFile(posterBg)
  
          console.log('avatarFileLocal :', posterBg, posterBgLocal);
          this.setState({
            shareTitle,
            posterBgLocal
          })
        }
      }     

    } catch (error) {
      hasError = true
      console.log('error :', error);
    } finally {
      this.setState({
        pageStatus: hasError ? 'error' : 'done',
        errorText: hasError ? '加载失败' : ''
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
    
    try {
      
      Taro.showLoading({
        title: '绘制中...'
      })
      const {
        avatarFileLocal,
        qrcodeFile,
        posterBgLocal
      } = this.state
      
      const posterCtx = Taro.createCanvasContext('canvasPoster')

      posterCtx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
      if (!avatarFileLocal) {
        return Error('需要重新进入页面')
      }
      // posterCtx.drawImage(require('../../images/poster-bg.jpg'), 0, 0, POSTER_WIDTH, POSTER_HEIGHT)
      let posterBg = posterBgLocal || require('../../images/poster-bg.jpg')
      posterCtx.drawImage(posterBg, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)
      posterCtx.drawImage(avatarFileLocal, 68, 340, SAVE_AVATAR_SIZE, SAVE_AVATAR_SIZE)
      posterCtx.drawImage(require('../../images/poster-line.png'), 1, 264, POSTER_WIDTH, POSTER_WIDTH)
      posterCtx.drawImage(require('../../images/logo-text.png'), 48, 1080, 320, 100)
      if (qrcodeFile) {
        drawRoundImage(posterCtx, qrcodeFile, 452, 1022, 107)
      }
  
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

  onHidePoster = () => {
    this.setState({
      isShowPoster: false
    })
  }

  renderPoster = () => {
    const { posterSrc, isShowPoster } = this.state
    return (
      <View className={`poster-dialog ${isShowPoster ? 'show' : ''}`}>
        <View className='poster-dialog-main'>
          <View className='poster-image-wrap'>
            {!!posterSrc && <Image className='poster-image' src={posterSrc} showMenuByLongpress></Image>}
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
                : <View className='page-back' onClick={this.goBack}></View>
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
                    <Button className="button button-share" openType='share' data-poster-src={avatarFileLocal}>保存并分享</Button>
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