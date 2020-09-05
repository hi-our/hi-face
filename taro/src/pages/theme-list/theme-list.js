import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Block, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import CustomTabBar from 'components/custom-tab-bar'
import ThemeDetail from './components/theme-detail'
import EventEmitter from 'utils/event-emitter'

import { getSystemInfo } from 'utils/common'

const { statusBarHeight } = getSystemInfo()

import './styles.styl';

@connect(state => ({
  themeList: state.global.themeList
}), null)
export default class ThemeList extends Component {
  config = {
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
    disableScroll: true,
    navigationBarTitleText: '主题列表 - Hi头像',
  }

  constructor(props) {
    super(props)
    this.state = {
      currentView: 0,
      activeTab: 0,
      tabBarIndex: -1
    }
  }

  componentWillMount() {
    Taro.setStorageSync('showBackToIndexBtn', false)
  }

  componentDidShow() {
    this.setState({
      tabBarIndex: 0
    })
  }
  componentDidHide() {
    this.setState({
      tabBarIndex: -1
    })
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'

    return {
      title: '邀请好友一起来制作头像吧',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/avatar-edit/avatar-edit'
    }
  }

  setCurrentView = (activeTab) => {
    const { themeList } = this.props
    const len = themeList.length
    if (len === 0) return

    let currentView = activeTab - 1
    if (currentView < 0) currentView = 0
    if (currentView > len - 1) currentView = len - 1

    this.setState({
      currentView,
    })
  }

  onSwitchTab = (activeTab) => {
    this.setCurrentView(activeTab)
    this.setState({
      activeTab
    })
  }
  onSwiperChange = (e) => {
    const { current } = e.detail
    this.setCurrentView(current)
    this.setState({
      activeTab: current
    })
  }

  onSwitchTheme = (themeId) => {
    EventEmitter.put('themeId', themeId)
    Taro.switchTab({
      url: '/pages/avatar-edit/avatar-edit'
    })
  }
  render() {
    const { themeList } = this.props
    const { activeTab, currentView, tabBarIndex } = this.state

    console.log('themeList :>> ', themeList);

    return (
      <Block>
        <View className='theme-list-page' style={{ paddingTop: `${statusBarHeight}px` }}>
          <View className='page-title'>主题列表</View>
          <View className='main-wrap'>
            <View className="theme-tabs">
              <ScrollView className="tabs-bar" scrollX scrollIntoView={`item-${currentView}`} scrollWithAnimation>
                {
                  themeList.map((theme, index) => {
                    const { _id: themeId, themeName, shareImageUrl } = theme
                    return (
                      <View className={`tabs-bar-item ${activeTab === index ? 'bar-active' : ''}`} key={themeId} id={`item-${index}`} onClick={this.onSwitchTab.bind(this, index)}>
                        <Image className="bar-image" src={shareImageUrl}></Image>
                        <View className="bar-text">{themeName}</View>
                      </View>
                    )
                  })
                }
              </ScrollView>
              <Swiper className="theme-swiper" current={activeTab} onChange={this.onSwiperChange}>
                {
                  themeList.map((theme) => {
                    const { _id: themeId } = theme
                    return (
                      <SwiperItem key={themeId}>
                        <ThemeDetail themeId={themeId} themeData={theme} onSwitch={this.onSwitchTheme} />
                      </SwiperItem>
                    )
                  })
                }
              </Swiper>
            </View>
          </View>
          <CustomTabBar selected={tabBarIndex} />
        </View>
      </Block>
    )
  }
}