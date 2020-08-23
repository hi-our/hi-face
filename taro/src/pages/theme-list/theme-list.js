import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Block, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import CustomTabBar from 'components/custom-tab-bar'
import ThemeDetail from './components/theme-detail'
import EventEmitter from 'utils/event-emitter'

import './styles.styl';

@connect(state => ({
  themeList: state.global.themeList
}), null)
export default class ThemeList extends Component {
  config = {
    navigationBarTitleText: '主题列表',
    disableScroll: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      currentView: 0,
      activeTab: 0,
    }
  }

  setCurrentView = (activeTab) => {
    const { themeList } = this.state
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
    console.log('activeTab :>> ', e);
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
    const { activeTab, currentView } = this.state

    return (
      <Block>
        <View className='theme-list-page'>
          <View className='main-wrap'>
            <View className="theme-tabs">
              <ScrollView className="tabs-bar" scrollX scrollIntoView={`item-${currentView}`} scrollWithAnimation>
                {
                  themeList.map((theme, index) => {
                    const { _id: themeId, themeName, shareImage } = theme
                    return (
                      <View className={`tabs-bar-item ${activeTab === index ? 'bar-active' : ''}`} key={themeId} id={`item-${index}`} onClick={this.onSwitchTab.bind(this, index)}>
                        <Image className="bar-image" src={shareImage}></Image>
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
          <CustomTabBar selected={0} />
        </View>
      </Block>
    )
  }
}