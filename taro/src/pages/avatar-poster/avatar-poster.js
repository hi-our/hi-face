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
    navigationStyle: 'custom',
    disableScroll: true
  }

  constructor(props) {
    super(props)
    const { uuid = '' } = this.$router.params
    this.pageUUID = uuid
    this.state = {
      avatarFileID: '',
      agetType: '',
      pageStatus: 'loading'
    }
  }

  componentDidMount() {
    this.loadData()
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    const { avatarFileID, agetType } = this.state

    let typeMap = {
      origin: '邀请好友一起来制作头像吧',
      childhood: '换个头像，一起回归童真'
    }

    return {
      title: typeMap[agetType] || typeMap.origin,
      imageUrl: avatarFileID || DEFAULT_SHARE_COVER,
      path: this.pageUUID ? `/pages/avatar-poster/avatar-poster?uuid=${this.pageUUID}` : '/pages/queen-king/queen-king'
    }
  }


  loadData = async () => {
    try {
      const { avatar_fileID = '', age_type = '' } = await cloudCallFunction({
        name: 'collection_get_one_by_uuid',
        data: {
          collection_name: 'avatars',
          uuid: this.pageUUID
        }
      })


      this.setState({
        avatarFileID: avatar_fileID,
        agetType: age_type,
        pageStatus: 'done'
      })


      
    } catch (error) {
        this.setState({
          pageStatus: 'error'
        })
        console.log('error :', error);
      
    }
  }

  goHome = () => {
    Taro.switchTab({
      url: '/pages/queen-king/queen-king'
    })
  }



  render() {
    const { avatarFileID, agetType, pageStatus } = this.state
 
    return (
      <PageWrapper status={pageStatus}>
        <View className={`page-avatar-poster age-${agetType}`}>
          <View className='page-poster-wrap'>
            <Image className='page-poster' src={avatarFileID} />
          </View>
          <View className='button-wrap'>
            <View className="button-reset" onClick={this.goHome}></View>
            <View className="button-main">生成分享海报</View>
            <Button className="button-share" openType='share'>邀请好友</Button>
          </View>
          <View className='version'>Ver.{version}，基于 Taro 及小程序云开发</View>
        </View>
      </PageWrapper>
    )
  }
}

export default AvatarPoster