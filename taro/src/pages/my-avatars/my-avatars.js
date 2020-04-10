import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
import { transformList } from './utils';
import './styles.styl'

import * as config from 'config'


const version = config.version

// @CorePage
class MyAvatars extends Component {
  config = {
    navigationBarTitleText: '头像列表',
  }

  constructor(props) {
    super(props)
    this.state = {
      list: [],
      pageStatus: 'loading',
      errorText: ''
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
      const data = await cloudCallFunction({
        name: 'collection_query_page',
        data: {
          collection_name: 'avatars',
          orderBy: {
            field: 'update_time'
          }
        }
      })

      console.log('data.length :', data.length);

      if (data.length === 0) {
        this.setState({
          pageStatus: 'empty',
          errorText: '数据为空'
        })
        return
      }
      
      this.setState({
        list: transformList(data),
        pageStatus: 'done'
      })

    } catch (error) {
      this.setState({
        pageStatus: 'error',
        errorText: '加载出错'
      })
      console.log('error :', error);

    }
  }


  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: '头像列表',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/self/self'
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

  goOneAvatar = (uuid) => {
    console.log('uuid :', uuid);
    Taro.navigateTo({
      url: `/pages/avatar-poster/avatar-poster?uuid=${uuid}`
    })
  }

  render() {
    const { list, pageStatus, errorText } = this.state


    return (
      <PageWrapper status={pageStatus} errorText={errorText}>
        <View className='avatar-list'>
          {
            list.filter(item => item.avatarFileID).map((item) => {
              console.log('item :', item);
              const { uuid, avatarFileID } = item
              console.log('avatarFileID :', avatarFileID);
              return (
                <View key={uuid} className="avatar-item" data-uuid={uuid} onClick={this.goOneAvatar.bind(this, uuid)}>
                  <Image className="avatar-image" src={avatarFileID}></Image>
                </View>
              )
            })
          }

        </View>
      </PageWrapper>
    )
  }
}

export default MyAvatars