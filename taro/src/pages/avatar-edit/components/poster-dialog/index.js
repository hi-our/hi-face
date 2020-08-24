import Taro from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import { downloadImgByBase64 } from 'utils/canvas-drawing'

import './styles.styl'

export default class PosterDialog extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    posterSrc: '',
    isH5Page: false
  }

  constructor(props) {
    super(props)
    this.state = {
      isShowPoster: true,
    }
  }

  previewPoster = () => {
    const { posterSrc } = this.props
    if (posterSrc !== '') Taro.previewImage({ urls: [posterSrc] })
  }

  onShowPoster = () => {
    this.setState({
      isShowPoster: true
    })
  }
  onHidePoster = () => {
    this.setState({
      isShowPoster: false
    })
  }

  savePoster = () => {
    const { posterSrc } = this.props

    if (posterSrc) {
      this.saveImageToPhotosAlbum(posterSrc)
    }
  }

  saveImageToPhotosAlbum = (tempFilePath) => {
    const { isH5Page } = this.props
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

  render(){
    

    const { isShowPoster } = this.state
    const { posterSrc, isH5Page, forCheck } = this.props

    return (
      <View className={`poster-dialog ${posterSrc && isShowPoster ? 'show' : ''}`}>
        <View className='poster-dialog-main'>
          {!!posterSrc && <Image className='poster-image' src={posterSrc} onClick={this.previewPoster} showMenuByLongpress></Image>}
          <View className='poster-image-tips'>点击可预览大图，长按可分享图片</View>
          <View className='poster-dialog-close' onClick={this.onHidePoster} />
          <View className='poster-footer-btn'>
            <View className='poster-btn-save' onClick={this.savePoster}>
              <Image
                className='icon'
                src='https://image-hosting.xiaoxili.com/img/20200812132636.png'
              />
              保存到相册
            </View>
            {!isH5Page && !forCheck && (
              <Button className='poster-btn-share' openType='share' data-poster-src={posterSrc}>
                <Image
                  className='icon-wechat'
                  src='https://image-hosting.xiaoxili.com/img/20200812132655.png'
                />
                分享给朋友
              </Button>
            )}
          </View>
        </View>

      </View>
    )
  }
}