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
      color: "#7A7E83",
      selectedColor: "#3cc51f",
      list: [
        {
          pagePath: '/pages/theme-list/theme-list',
          text: '主题',
          iconPath: '../../images/thank-1.png',
          selectedIconPath: '../../images/thank-2.png'
        },
        {
          pagePath: '/pages/avatar-edit/avatar-edit',
          text: '编辑',
          iconPath: '../../images/tab-bar-crown.png',
          selectedIconPath: '../../images/tab-bar-crown-active.png'
        },
        {
          pagePath: '/pages/self/self',
          text: '我的',
          iconPath: '../../images/thank-1.png',
          selectedIconPath: '../../images/thank-2.png'
        },]
    }
  }

  componentDidMount() {
    const abc = this.$scope.getTabBar()
    console.log('abc :>> ', abc);
  }

  switchTab = (e) => {
    const data = e.currentTarget.dataset
    const url = data.path
    wx.switchTab({ url })
    this.setState({
      selected: data.index
    })
  }
  render() {
    const { selected, isHide } = this.props
    const { list } = this.state
    return (
      <View className={`tab-bar ${IS_IPHONEX ? 'bottom-safe-area' : ''}`}>
        {
          list.map((item, index) => {
            console.log('selected === index :>> ', selected === index);
            const { pagePath, selectedIconPath, iconPath, text } = item
            return (
              <View key={text} className="tab-bar-item" data-path={pagePath} data-index={index} onClick={this.switchTab}>
                {
                  index === 1 && isHide
                    ? <View>Hide</View>
                    : (
                      <Block>
                        <Image className="tab-bar-image" src={'' + (selected === index ? selectedIconPath : iconPath)}></Image>
                        <View>{text}</View>
                      </Block>
                    )
                }
                
              </View>
            )
          })
        }
      </View>
    )
  }
}