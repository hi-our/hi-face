import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button } from '@tarojs/components'
import CorePage from 'page'
import PageWrapper from 'components/page-wrapper'
// import LoginBtn from 'components/login-btn-wx'
import VideoPlayer from 'components/video-player'
import Banner from './components/bannner'
import { navigateTo, redirectTo } from 'utils/navigate'
import { VIDEO_STATUS } from './utils'

const UN_LOGIN_HBG = 'https://n1image.hjfile.cn/res7/2019/11/22/cdaeb242a862231ca221e7da300334b4.png'

import './styles.styl'

// @CorePage
class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
    // navigationStyle: 'custom'
  }

  constructor(props) {
    super(props)
    this.state = {
      groupId: '',
      videoStatus: VIDEO_STATUS.NOT_PLAY,
    }
  }

  // // loginBtnRef = el => this.loginBtn = el

  loginBtnClick = () => {
    // this.loginBtn.login()
  }
  switchBtnClick = () => {
    this.loginBtn.login({
      type: 'switch'
    })
  }

  onGoMyDaka = () => {
    navigateTo({
      url: 'pages/my-daka/my-daka'
    })
  }

  onGroupInput = (e) => {
    let value = e.detail.value
    this.setState({
      groupId: value
    })
  }

  onGoGroup = () => {
    const { groupId } = this.state
    if (!groupId || !(parseInt(groupId) > 0)) return
    redirectTo({
      url: `/pages/group/group?groupId=${groupId}`
    })
  }

  renderUnlogin = () => {
    const addTop = { marginTop: '40px' }

    return (
      <View className='discover'>
        <Image className='unlogin-img' src={UN_LOGIN_HBG} />
        <View className='discovery-text' style={addTop}>
          Hi，亲爱的朋友
        </View>
        <View className='discovery-text'>登录后可查看“我的打卡”</View>
        {/* <View onClick={this.loginBtnClick} className='discovery-btn'>登录</View> */}
      </View>
    )
  }

  onPlayStart = () => {
    this.setState({
      videoStatus: VIDEO_STATUS.PLAYING
    })
  }
  
  onPlayEnd = () => {
    this.setState({
      videoStatus: VIDEO_STATUS.ENDED
    })
  }

  render () {
    const { isLogin } = this.props
    const { videoStatus } = this.state

    return (
      <PageWrapper>
        <View className='index'>
          <Banner
            src='https://n1video.hjfile.cn/res7/2020/01/17/7ecb04ca6a368183e6084b312e24138f.mp4'
            poster='https://n1image.hjfile.cn/res7/2020/01/16/f5cba34934ec6ff5022cad217c481533.png'
            showName='视频播放地址你的呢我那个我能够翁我'
            status={videoStatus}
            onPlayStart={this.onPlayStart}
            onPlayEnd={this.onPlayEnd}
          />
          <View className='dialog-fixed'>模拟遮挡层</View>
          <View class='user-info'>
            {
              !isLogin
                ? this.renderUnlogin()
                : (
                  <View className='discover'>
                    <View onClick={this.switchBtnClick} className='discovery-btn'>账号切换</View>
                    <View className='discovery-text'>↑已登录↑</View>
                    <View onClick={this.onGoMyDaka} className='discovery-btn'>去我的打卡</View>
                    <View className='group-wrap'>
                      <Input className='border account' type='number' placeholder='请输入群号' onInput={this.onGroupInput}></Input>
                      <Button
                        className='discovery-btn'
                        type='default'
                        onClick={this.onGoGroup}
                      >跳转</Button>
                    </View>
                  </View>
                )
            }
          </View>
          {/* {/* <LoginBtn */}
            // ref={this.loginBtnRef}
          /> */}
        </View>
      </PageWrapper>
    )
  }
}

export default Index