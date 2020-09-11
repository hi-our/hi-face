// <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import * as config from 'config'

import './styles.styl'

const version = config.version

export default class ToTop extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  render() {
    return <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
  }


}