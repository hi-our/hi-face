import Taro from '@tarojs/taro'
import { View, Block, Image } from '@tarojs/components'
import { getSystemInfo, imageThumb } from 'utils/common'

const { statusBarHeight } = getSystemInfo()

import './styles.styl'

export default class MenuMain extends Taro.PureComponent {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    activeThemeId: 0,
    themeList: [],
    isShowMenuMain: false,
    onMenuMainTogggle: () => {},
    onSwitchTheme: () => {},
  }

  onMenuMainTogggle = () => {
    const { onMenuMainTogggle } = this.props
    onMenuMainTogggle()
  }

  onSwitchTheme = (themeId) => {
    const { onSwitchTheme } = this.props
    onSwitchTheme(themeId)
    this.onMenuMainTogggle()
  }

  goToAbout = () => {
    Taro.navigateTo({
      url: '/pages/about/about'
    })
    // this.onMenuMainTogggle()
  }

  render() {
    const { isShowMenuMain, activeThemeId, themeList } = this.props

    return (
      <Block>
        <View className={`menu-main-mask ${isShowMenuMain ? 'menu-open' : ''}`} onClick={this.onMenuMainTogggle}></View>
        <View className={`menu-main ${isShowMenuMain ? 'menu-open' : ''}`}>
          <View className={`menu-main-toggle ${isShowMenuMain ? 'menu-open' : ''}`} onClick={this.onMenuMainTogggle} style={{ marginTop: statusBarHeight + 'px' }}>
          </View>
          <View className="menu-title">主题列表</View>
          <View className="theme-list">
            {
              themeList.map((theme) => {
                const { _id: themeId, themeName, shareImageUrl, iconImageUrl } = theme
                let imageWebp = imageThumb(iconImageUrl || shareImageUrl, 140, 140)

                return (
                  <View className={`theme-item ${activeThemeId === themeId ? 'theme-active' : ''}`} key={themeId} onClick={this.onSwitchTheme.bind(this, themeId)}>
                    <Image className="theme-image" src={imageWebp} webp></Image>
                    <View className="theme-text">{themeName}</View>
                  </View>
                )
              })
            }
          </View>
          <View className="about-wrap" onClick={this.goToAbout}>
            <View className="menu-title">关于作者</View>
            <View className="about-btn">了解更多</View>
            <View className="about-text">设计 - 不二雪</View>
            <View className="about-text">开发 - 小溪里</View>

          </View>
        </View>
        {/* <View className={`menu-main-toggle ${isShowMenuMain ? 'menu-open' : ''}`} onClick={this.onMenuMainTogggle} style={{ marginTop: statusBarHeight + 'px' }}>
          <View className="menu-line"></View>
          <View className="menu-line"></View>
          <View className="menu-line"></View>
        </View> */}
      </Block>
    )
  }
}