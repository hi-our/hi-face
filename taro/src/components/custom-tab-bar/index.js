import Taro from '@tarojs/taro'
import { Block, View, Image, CoverView, CoverImage } from '@tarojs/components'
import { isIphoneSafeArea } from 'utils/common';
import './styles.styl'

const IS_IPHONEX = isIphoneSafeArea()

export default class CustomTabBar extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  constructor(props) {
    super(props)
    this.state = {
      list: [
        {
          pagePath: '/pages/theme-list/theme-list',
          text: '主题',
          iconPath: '../../images/tab-theme-1.png',
          selectedIconPath: '../../images/tab-theme-2.png'
        },
        {
          pagePath: '/pages/avatar-edit/avatar-edit',
          text: '编辑',
          iconPath: '../../images/tab-edit-1.png',
          selectedIconPath: '../../images/tab-edit-2.png'
        },
        {
          pagePath: '/pages/self/self',
          text: '我的',
          iconPath: '../../images/tab-self-1.png',
          selectedIconPath: '../../images/tab-self-2.png'
        },
      ]
    }
  }

  switchTab = (e) => {
    const data = e.currentTarget.dataset
    const url = data.path
    wx.switchTab({ url })
  }
  render() {
    const { selected, hideIndex } = this.props
    const { list } = this.state
    return (
      <View className={`tab-bar ${IS_IPHONEX ? 'bottom-safe-area' : ''}`}>
        {
          list.map((item, index) => {
            const { pagePath, selectedIconPath, iconPath, text } = item
            return (
              <View key={text} className={`tab-bar-item ${selected === index ? 'tab-item-active' : ''} ${hideIndex === index ? 'tab-item-hide' : ''}`} data-path={pagePath} data-index={index} onClick={this.switchTab}>
                <Image className="tab-bar-image" src={'' + (selected === index ? selectedIconPath : iconPath)}></Image>
                <View className="tab-bar-text">{text}</View>
                <View className="tab-bar-holder"></View>
              </View>
            )
          })
        }
      </View>
    )
  }
}