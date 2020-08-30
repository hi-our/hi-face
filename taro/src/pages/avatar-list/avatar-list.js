import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper'
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

  loadData = async (pageNo = 1) => {
    try {
      const { items } = await cloudCallFunction({
        name: 'api',
        data: {
          $url: 'avatar/list',
          pageSize: 50,
        }
      })

      if (pageNo === 1 && items.length === 0) {
        this.setState({
          pageStatus: 'empty',
          errorText: '数据为空'
        })
        return
      }
      
      this.setState({
        list: items,
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
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'

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
              const { uuid, avatarFileID } = item
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