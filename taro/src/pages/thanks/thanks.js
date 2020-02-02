import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { DATA } from './data'
import './styles.styl'

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

  copyToClipboard = (str) => {
    Taro.setClipboardData({
      data: str,
      success() {
        Taro.showToast({
          icon: 'none',
          title: '复制成功'
        })
      },
      fail() {
        console.log('setClipboardData调用失败')
      }
    })

  }

  render() {
    const { thanksWord, authorAvatar, authorName, authorDesc, sourceLink, referenceList } = DATA
    console.log('thanksWord :', thanksWord);
    return (
      <View>
        <View className='thanks-word'>
          <Text>{thanksWord}</Text>
        </View>
        <View className='author-wrap'>
          <Image className='author-avatar' src={authorAvatar} />
          <View className='author-main'>
            <Text className='author-name'>{authorName}</Text>
            <Text className='author-desc'>{authorDesc}</Text>
            <Button className='copy-link-btn' onClick={this.copyToClipboard.bind(this, sourceLink)}>复制源码地址</Button>
          </View>

        </View>
        <View className='reference-wrap'>
          <View className='reference-title'>参考项目</View>
          <View>
            {
              referenceList.map((reference) =>{
                const { image, desc } = reference
                return (
                  <View className='reference-item' key={image}>
                    <Image className='reference-image' src={image} />
                    <View className='reference-main'>
                      <Text className='reference-text'>{desc}</Text>
                      
                    </View>
                  </View>
                )
              }) 
            }
          </View>
        </View>
      </View>
    )
  }
}

export default Thanks