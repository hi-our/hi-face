import Taro from '@tarojs/taro'
import { View, Block } from '@tarojs/components'

import './styles.styl'

export default class MenuMain extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    isShowMenuMain: false,
    onMenuMainTogggle: () => {}
  }

  onMenuMainTogggle = () => {
    const { onMenuMainTogggle } = this.props
    onMenuMainTogggle()
  }

  render() {
    const { isShowMenuMain } = this.props

    return (
      <Block>
        <View className={`menu-main-mask ${isShowMenuMain ? 'menu-open' : ''}`}></View>
        <View className={`menu-main ${isShowMenuMain ? 'menu-open' : ''}`}></View>
        <View className={`menu-main-toggle ${isShowMenuMain ? 'menu-open' : ''}`} onClick={this.onMenuMainTogggle}>菜单</View>
      </Block>
    )
  }
}