import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper';
import './styles.styl'

import * as config from 'config'


const version = config.version

// @CorePage
class Thanks extends Component {
  config = {
    navigationBarTitleText: '致谢',
  }

  constructor(props) {
    super(props)
    this.state = {
      pageData: {},
      pageStatus: 'loading'
    }
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async () => {
    // var testData = ''
    // for (let index = 0; index < 10000; index++) {
    //   testData += '0123456789'
    // }

    // console.log('testData :', testData)
    // console.log('testData大小为 :', testData.length / 1024 + 'k')

    try {
      const res = await cloudCallFunction({
        name: 'thanks-data'
      })
      console.log('res :', res);
      this.setState({
        pageData: res,
        pageStatus: 'done'
      })
      
    } catch (error) {
        this.setState({
          pageStatus: 'error'
        })
        console.log('error :', error);
      
    }
  }


  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

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
    const { pageData, pageStatus } = this.state
    const {
      thanksWord = '',
      authorAvatar = '',
      authorName = '',
      authorDesc = '',
      sourceLink = '',
      referenceList = []
    } = pageData
 
    return (
      <PageWrapper status={pageStatus}>
        <View className='thanks-page'>
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
          <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
        </View>
      </PageWrapper>
    )
  }
}

export default Thanks