import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'

import { cloudCallFunction } from 'utils/fetch'
import PageWrapper from 'components/page-wrapper';
import './styles.styl'

import * as config from 'config'


const version = config.version

// @CorePage
class AvatarPoster extends Component {
  config = {
    navigationBarTitleText: '头像分享',
    navigationStyle: 'custom'
  }

  constructor(props) {
    super(props)
    const { uuid = '' } = this.$router.params
    this.pageUUID = uuid
    this.state = {
      pageData: {},
      pageStatus: 'loading'
    }
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async () => {
    try {
      const res = await cloudCallFunction({
        name: 'collection_get_one_by_uuid',
        data: {
          collection_name: 'avatars',
          uuid: this.pageUUID
        }
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
      title: '邀请好友？？？？？',
      imageUrl: DEFAULT_SHARE_COVER,
      path: this.pageUUID ? `/pages/avatar-poster/avatar-poster?uuid=${this.pageUUID}` : '/pages/queen-king/queen-king'
    }
  }

  render() {
    const { pageData, pageStatus } = this.state
    const {
      avatar_fileID = '',
    } = pageData
 
    return (
      <PageWrapper status={pageStatus}>
        <View className="page-avatar-poster">
          <View className='page-title'>女神戴皇冠</View>
          <View className='page-poster-wrap'>
            <Image className='page-poster' src={avatar_fileID} />
          </View>
          
          <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
        </View>
      </PageWrapper>
    )
  }
}

export default AvatarPoster