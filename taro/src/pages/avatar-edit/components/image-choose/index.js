import Taro from '@tarojs/taro'
import { Block, View, Button } from '@tarojs/components'
import { getImg } from 'utils/canvas-drawing'
import TaroCropper from 'components/taro-cropper'

import './styles.styl'

export default class BackHome extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    styles: '',
    onChoose: () => {},
    cropperWidth: 600,
    cropperHeight: 600
  }

  constructor(props) {
    super(props)
    this.state = {
      originSrc: ''
    }
  }

  onChooseImage = (way) => {
    Taro.chooseImage({
      count: 1,
      sourceType: [way],
    }).then(res => {
      this.setState({
        originSrc: res.tempFilePaths[0]
      });
    }).catch(error => {
      console.log('error :', error);
    })
  }

  onCut = (cutImageSrc) => {
    const { onChoose } = this.props
    onChoose(cutImageSrc)
    this.setState({
      originSrc: ''
    })
  }

  onGetUserInfo = async (e) => {
    const { onChoose } = this.props
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      // TODO写法，用于更换图片
      Taro.showToast({
        icon: 'none',
        title: '获取头像...'
      })
      try {
        let avatarUrl = await getImg(e.detail.userInfo.avatarUrl)
        if (avatarUrl) {
          onChoose(avatarUrl)
        }

      } catch (error) {
        console.log('avatarUrl download error:', error);
        Taro.showToast({
          icon: 'none',
          title: '获取失败，请使用相册'
        })
      }
    }
  }

  render() {
    const { cropperWidth, cropperHeight } = this.props
    const { originSrc } = this.state

    const { isH5Page } = this.props
    return (
      <Block>
        <View
          className='to-choose'
          onClick={this.onChooseImage.bind(this, 'album')}
        />
        <View className='button-wrap'>
          <View className="buttom-tips">更多选择</View>
          {
            !isH5Page && (
              <Button
                className="button-avatar"
                type="default"
                openType="getUserInfo"
                onGetUserInfo={this.onGetUserInfo}
              >
                使用头像
              </Button>
            )
          }
          <Button 
            className='button-camera'
            type="default"
            onClick={this.onChooseImage.bind(this, 'camera')}
          >
            使用相机
          </Button>
        </View>
        <View className='cropper-wrap' style={{ display: originSrc ? 'block' : 'none' }}>
          <TaroCropper
            src={originSrc}
            cropperWidth={cropperWidth}
            cropperHeight={cropperHeight}
            pixelRatio={2}
            ref={node => this.taroCropperRef = node}
            fullScreen
            fullScreenCss
            onCut={this.onCut}
            hideCancelText={false}
            onCancel={this.onCancel}
          />
        </View>
      </Block>
    )
  }
  
}