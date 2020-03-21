import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
import { base64src, downloadImgByBase64, getImg } from 'utils/canvas-drawing'
import { fillText } from 'utils/canvas'
import promisify from 'utils/promisify'
import { SAVE_IMAGE_WIDTH, SAVE_IMAGE_HEIGHT, DPR_CANVAS_SIZE, SAVE_CODE_SIZE, SAVE_PAGE_DPR } from './utils'

import './styles.styl'

import * as config from 'config'

const isH5Page = process.env.TARO_ENV === 'h5'
const isQQPage = process.env.TARO_ENV === 'qq'


const version = config.version

// @CorePage
class AvatarPoster extends Component {
  config = {
    navigationBarTitleText: '头像分享',
    navigationStyle: 'custom',
    disableScroll: true
  }

  constructor(props) {
    super(props)
    const { uuid = '' } = this.$router.params
    this.pageUUID = uuid
    this.pageUrl = this.pageUUID ? `/pages/avatar-poster/avatar-poster?uuid=${this.pageUUID}` : '/pages/queen-king/queen-king'
    this.state = {
      avatarFileID: '',
      avatarFileLocal: '',
      agetType: '',
      pageStatus: 'loading',
      isAuthor: false,
      errorText: ''
    }
  }

  componentDidMount() {
    this.loadData()
    this.onCreateQrcode()
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    const { avatarFileID, agetType } = this.state

    let typeMap = {
      origin: '邀请好友一起来制作头像吧',
      childhood: '换个头像，一起回归童真'
    }

    return {
      title: typeMap[agetType] || typeMap.origin,
      imageUrl: avatarFileID || DEFAULT_SHARE_COVER,
      path: this.pageUrl
    }
  }

  onCreateQrcode = async () => {
    try {
      const { base64Main } = await cloudCallFunction({
        name: 'open-api',
        data: {
          action: 'createMiniCode',
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
      const { avatar_fileID = '', age_type = '', is_author } = await cloudCallFunction({
        name: 'collection_get_one_by_uuid',
        data: {
          collection_name: 'avatars',
          uuid: this.pageUUID,
        }
      })
      
      console.log('is_author :', avatar_fileID, is_author);
      this.setState({
        avatarFileID: avatar_fileID,
        isAuthor: is_author,
        agetType: age_type,
      })

      let avatarFileLocal = await this.onDownloadFile(avatar_fileID)

      console.log('avatarFileLocal :', avatarFileLocal);
      this.setState({
        avatarFileLocal
      })

      // setTimeout(() => {
      //   this.onCreatePoster()
      // }, 1000);

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

  goHome = () => {
    Taro.switchTab({
      url: '/pages/queen-king/queen-king'
    })
  }

  onDownloadFile = async (fileID) => {

    if (isH5Page) {
      let { tempFilePath } = await Taro.cloud.downloadFile({
        fileID,
      })
      return tempFilePath
    }

    let downloadFile = promisify(Taro.cloud.downloadFile)
    let { tempFilePath } = await downloadFile({
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

  onCreatePoster = async () => {
    try {
      
      Taro.showLoading({
        title: '绘制中...'
      })
      const {
        avatarFileLocal,
        qrcodeFile
      } = this.state
      
      console.log('avatarFileLocal :', avatarFileLocal);
  
      const pc = Taro.createCanvasContext('canvasPoster')

      console.log('pc :', pc);
  
      pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_HEIGHT);
      if (!avatarFileLocal) {
        return Error('需要重新进入页面')
      }
      pc.drawImage(avatarFileLocal, 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)
      if (qrcodeFile) {
        pc.drawImage(qrcodeFile, 210 * SAVE_PAGE_DPR, 320 * SAVE_PAGE_DPR, SAVE_CODE_SIZE, SAVE_CODE_SIZE)
      }
      fillText(pc, '我做了一个新头像，赞我哟', 10 * SAVE_PAGE_DPR, 360 * SAVE_PAGE_DPR, true, 30, '#3d3d3d')
      fillText(pc, '长按识别小程序，来一起换头像吧', 10 * SAVE_PAGE_DPR, 380 * SAVE_PAGE_DPR, false, 20, '#3d3d3d')

      console.log('2 :', 2);
  
      pc.draw(true, () => {
        console.log('3 :', 3);
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
  
            console.log('res.tempFilePath :', res.tempFilePath);
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
    const { avatarFileID, agetType, pageStatus, isAuthor, avatarFileLocal, errorText } = this.state
 
    return (
      <Block>
        <Canvas className='canvas-poster' style={{ width: SAVE_IMAGE_WIDTH + 'px', height: SAVE_IMAGE_HEIGHT + 'px' }} canvasId='canvasPoster' ref={c => this.canvasPosterRef = c} />
        <PageWrapper status={pageStatus} errorText={errorText}>
          <View className={`page-avatar-poster age-${agetType}`}>
            <View className='page-poster-wrap'>
              <Image className='page-poster' src={avatarFileLocal || avatarFileID} />
            </View>
            {
              isAuthor
                ? (
                  <View className='button-wrap'>
                    <View className="button-save" onClick={this.onSaveImage}>保存图片</View>
                    <View className="button-main" onClick={this.onCreatePoster}>生成分享海报</View>
                    <Button className="button-share" openType='share'>邀请好友</Button>
                  </View>
                )
                : (
                  <View className='button-wrap'>
                    <View className="button-main" onClick={this.goHome}>我也要玩</View>
                  </View>
                )
            }
            <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
          </View>
          {this.renderPoster()}
        </PageWrapper>
      </Block>
    )
  }
}

export default AvatarPoster