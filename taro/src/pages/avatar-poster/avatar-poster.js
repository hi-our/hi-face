import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
import { base64src, downloadImgByBase64 } from 'utils/canvas-drawing'
import promisify from 'utils/promisify'

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
      pageStatus: 'loading'
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
          action: 'createQRCode',
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
    try {
      const { avatar_fileID = '', age_type = '' } = await cloudCallFunction({
        name: 'collection_get_one_by_uuid',
        data: {
          collection_name: 'avatars',
          uuid: this.pageUUID
        }
      })


      this.setState({
        avatarFileID: avatar_fileID,
        agetType: age_type,
      })

      let avatarFileLocal = await this.onDownloadFile(avatar_fileID)

      this.setState({
        avatarFileLocal
      })

      setTimeout(() => {
        this.onCreatePoster()
      }, 1000);

    } catch (error) {
        this.setState({
          pageStatus: 'error'
        })
        console.log('error :', error);
    } finally {
      this.setState({
        pageStatus: 'done'
      })
    }
  }

  goHome = () => {
    Taro.switchTab({
      url: '/pages/queen-king/queen-king'
    })
  }

  onDownloadFile = async (fileID) => {

    let downloadFile = promisify(Taro.cloud.downloadFile)
    const { tempFilePath } = await downloadFile({
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

  onCreatePoster = () => {
    this.setState({
      isShowPoster: true
    })
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
    const { avatarFileID, agetType, pageStatus } = this.state
 
    return (
      <PageWrapper status={pageStatus}>
        <View className={`page-avatar-poster age-${agetType}`}>
          <View className='page-poster-wrap'>
            <Image className='page-poster' src={avatarFileID} />
          </View>
          <View className='button-wrap'>
            <View className="button-save" onClick={this.onSaveImage}>保存图片</View>
            <View className="button-main">生成分享海报</View>
            <Button className="button-share" openType='share'>邀请好友</Button>
          </View>
          <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
        </View>
        {this.renderPoster()}
      </PageWrapper>
    )
  }
}

export default AvatarPoster