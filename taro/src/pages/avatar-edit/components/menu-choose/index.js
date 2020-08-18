import Taro from '@tarojs/taro'
import { View, Block, Image, Button } from '@tarojs/components'
import { isIphoneSafeArea } from 'utils/common';

import './styles.styl'
const IS_IPHONEX = isIphoneSafeArea()

export default class MenuChoose extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    isShowMenuMain: false,
    onMenuMainTogggle: () => { }
  }

  constructor(props) {
    super(props)
    this.state = {
      isMenuOpen: false
    }
  }

  onMenuMainTogggle = () => {
    const { onMenuMainTogggle } = this.props
    onMenuMainTogggle()
  }
  onMenuOpenToggle = () => {
    this.setState({
      isMenuOpen: !this.state.isMenuOpen
    })
  }

  render() {
    const { isMenuShow } = this.props
    const { isMenuOpen } = this.state

    return (
      <View className={`menu-choose ${IS_IPHONEX ? 'bottom-safe-area' : ''} ${isMenuShow ? 'menu-show' : ''} ${isMenuOpen ? 'menu-open' : ''}`} onClick={this.onMenuOpenToggle}>
        <View className='menu-item menu-item-avatar'>头像2</View>
        <View className='menu-item menu-item-camera'>拍照</View>
        <View className='menu-item menu-item-album'>相册</View>
        <View className='menu-item menu-item-search'>搜索</View>
        <View className='menu-choose-btn'></View>
      </View>
    )
  }
}