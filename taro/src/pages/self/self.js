import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Canvas, ScrollView, Block } from '@tarojs/components'
import Version from 'components/version'

import CorePage from 'page'
import CustomTabBar from 'components/custom-tab-bar'
import AvatarList from './components/avatar-list';
import userActions from '@/store/user'
import './styles.styl'
import { getSystemInfo } from 'utils/common'

const { statusBarHeight } = getSystemInfo()

@CorePage
class Self extends Component {
  config = {
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
    navigationBarTitleText: '我的 - Hi头像',
    enablePullDownRefresh: true,
    backgroundColorTop: '#ffffff',
    backgroundColorBottom: '#ffffff',
  }

  constructor(props) {
    super(props)
    this.state = {
      tabBarIndex: -1
    }
  }

  componentWillMount() {
    Taro.setStorageSync('showBackToIndexBtn', false)
  }

  componentDidShow() {
    console.log('self show :>> ')
    this.setState({
      tabBarIndex: 2
    })
  }
  componentDidHide() {
    console.log('self hide :>> ')
    this.setState({
      tabBarIndex: -1
    })
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'

    return {
      title: '邀请好友一起来制作头像吧',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/avatar-edit/avatar-edit'
    }
  }

  onPullDownRefresh = () => {
    console.log('onPullDownRefresh :>> ');
    this.listRef && this.listRef.loadData()
    Taro.showToast({
      title: '已刷新列表',
      icon: 'none'
    })
    Taro.stopPullDownRefresh()
  }


  goOneAvatar = (uuid) => {
    console.log('uuid :', uuid);
    Taro.navigateTo({
      url: `/pages/avatar-poster/avatar-poster?uuid=${uuid}`
    })
  }

  goMyAvatars = () => {
    Taro.navigateTo({
      url: '/pages/my-avatars/my-avatars'
    })
  }
  goThanks = () => {
    Taro.navigateTo({
      url: '/pages/thanks/thanks'
    })
  }

  onGetUserInfo = (e) => {
    if (e.detail.userInfo) {
      userActions.login()
    }
  }

  renderNotLogin = () => {
    return (
      <Block>
        <View className='user-wrap'>
          <Image className='avatar' src='https://image-hosting.xiaoxili.com/img/img/20200902/e1ea53494a96e99854aa40e87b3c9ca4-d897c7.png' />
          <View className='nick-name'>Hi~</View>
          <View className='address-text'>欢迎登录 Hi 头像</View>
        </View>
        <View className='login-wrap'>
          <Image className="logo-image" src="https://image-hosting.xiaoxili.com/img/img/20200830/41eb7adb16c09f5b25137fe708269e12-11e1fa.png"></Image>
          <Button className="login-button" type="default" openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>微信一键授权</Button>
          <View className="login-tips">登录后查看历史作品</View>
          <Version />
        </View>
      </Block>
    )
  }

  renderHasLogin = () => {
    const {  userInfo } = this.props
    const { wechatInfo = {}, avatar } = userInfo
    const { avatarUrl, nickName, country = '', province = '', city = '' } = wechatInfo
    
    return (
      <Block>
        <View className='user-wrap'>
          <View className='avatar'>
            <Image src={avatarUrl || avatar}></Image>
          </View>
          <View className='nick-name'>{nickName}</View>
          <View className='address-text'>让头像更有趣</View>
        </View>
        <ScrollView className="avatar-wrap" scrollY>
          <AvatarList ref={c => this.listRef = c} />
          <Version />
        </ScrollView>
      </Block>
    )
  }

  render() {
    const { tabBarIndex } = this.state
    const { isLogin, userInfo } = this.props

    const { wechatInfo = { }, avatar } = userInfo
    const { avatarUrl } = wechatInfo

    let isShowLogin = !!(avatarUrl || avatar)

    return (
      <View className='self-page' style={{ paddingTop: `${statusBarHeight}px` }}>
        <View className='page-title'>我的</View>
        <View className='main-wrap'>
          {isShowLogin ? this.renderHasLogin() : this.renderNotLogin()}
        </View>
        <CustomTabBar selected={tabBarIndex} />
      </View>
    )
  }
}

export default Self