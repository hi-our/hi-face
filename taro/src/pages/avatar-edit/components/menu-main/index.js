import Taro from '@tarojs/taro'
import { View, Block } from '@tarojs/components'

import './styles.styl'

export default class MenuMain extends Taro.PureComponent {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    themeList: [],
    isShowMenuMain: false,
    onMenuMainTogggle: () => {}
  }

  onMenuMainTogggle = () => {
    const { onMenuMainTogggle } = this.props
    onMenuMainTogggle()
  }

  render() {
    const { isShowMenuMain, themeList } = this.props
    console.log('menuMain themeList :>> ', themeList);

    return (
      <Block>
        <View className={`menu-main-mask ${isShowMenuMain ? 'menu-open' : ''}`} onClick={this.onMenuMainTogggle}></View>
        <View className={`menu-main ${isShowMenuMain ? 'menu-open' : ''}`}>
          <View>主题列表</View>
          <View>

          </View>
        </View>
        <View className={`menu-main-toggle ${isShowMenuMain ? 'menu-open' : ''}`} onClick={this.onMenuMainTogggle}>
          <View className="menu-line"></View>
          <View className="menu-line"></View>
          <View className="menu-line"></View>
        </View>
      </Block>
    )
  }
}