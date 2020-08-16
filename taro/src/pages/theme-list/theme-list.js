import Taro, { Component } from '@tarojs/taro'
import { View, Image, Canvas } from '@tarojs/components'
import CustomTabBar from 'components/custom-tab-bar'

export default class ThemeList extends Component {
  config = {
    navigationBarTitleText: '主题列表',
    // usingComponents: {
    //   'tab-bar': '../../components/custom-tab-bar/index'
    // }

  }
  render() {
    return (
      <View>主题列表
        <CustomTabBar selected={0} />
      </View>
    )
  }
}