import Taro, { Component } from '@tarojs/taro'
import { View, Text, Icon, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { DATA } from './data'

// @CorePage
class Thanks extends Component {
  config = {
    navigationBarTitleText: '致谢',
  }


  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2018/12/20/9de3c702be8dea2066b44913e95a9f8c.jpg?imageView2/1/w/375/h/300'

    return {
      title: '致谢',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/thanks/thanks'
    }
  }

  render() {
    const { thanksWord } = DATA
    console.log('thanksWord :', thanksWord);
    return (
      <View>
        <Text>{thanksWord}</Text>
      </View>
    )
  }
}

export default Thanks