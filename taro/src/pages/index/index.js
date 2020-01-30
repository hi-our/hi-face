import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
import CorePage from 'page'
import PageWrapper from 'components/page-wrapper'
// import LoginBtn from 'components/login-btn-Taro'
import VideoPlayer from 'components/video-player'
import Banner from './components/bannner'
import { navigateTo, redirectTo } from 'utils/navigate'
import { VIDEO_STATUS } from './utils'
import fetch from 'utils/fetch'
import { requestExternalImage } from 'utils/image-utils'
import { apiMyFace } from 'constants/apis'
import { getHatInfo } from 'utils/face-utils'
import { getSystemInfo } from 'utils/common'
import { drawing } from 'utils/canvas-drawing'

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
      bgPic: '',
    }
  }

  componentDidMount() {
    this.testFetch()
    // setTimeout(() => {
    //   const ctx = Taro.createCanvasContext('canvasHat')
  
    //   console.log('ctx :', ctx);
  
    //   ctx.setFontSize(20)
    //   ctx.fillText('Hello', 20, 20)
    //   ctx.fillText('MINA', 100, 100)
    //   ctx.draw()
      
    // }, 3000);
  }

  testFetch = async () => {
    let testImg = 'http://n1image.hjfile.cn/res7/2020/01/30/8cb348fc7759f1709e2268d70dd7c676.jpg'
    try {
      const res2 = await fetch({
        url: apiMyFace,
        data: {
          baseData: testImg
        }
      })

      

      console.log('res2 :', res2);

      const { ImageWidth, ImageHeight } = res2

      const { windowWidth  } = getSystemInfo()

      let tmpHeight = windowWidth / ImageWidth * ImageHeight

      console.log('tmpHeight :', tmpHeight);
      

      

      const info = getHatInfo(res2)
      drawing(this.canvasRef, {
        info,
        imgSrc: testImg,
        width: windowWidth,
        height: tmpHeight,
      })

      
    } catch (error) {
      console.log('error :', error);
    }
  }

  loadImageFromUrl = async (url) => {
    const img = await requestExternalImage(url);
    console.log('img :', img);
    // inputImg.src = img.src;
    // updateResults();
  }

  chooseImage = async (from) => {

    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [from.target.dataset.way]
    })
    let tempFilePaths = res.tempFilePaths[0]
    this.setState({
      bgPic: tempFilePaths
    })
  }

  submitUpload = async () => {
    try {
      // const res = await Taro.request({
      //   // url: this.state.bgPic,
      //   url: 'https://n1image.hjfile.cn/res7/2020/01/30/8cb348fc7759f1709e2268d70dd7c676.jpg',
      //   method: 'GET',
      //   responseType: 'arraybuffer'
      // })
      // console.log('res :', res);
      // let base64 = Taro.arrayBufferToBase64(res.data);
      // let userImageBase64 = 'data:image/jpg;base64,' + base64;
      // console.log('userImageBase64', userImageBase64); // 打印base64格式图片
      // // 如果需要使用本地缓存图片，请参照第一步
      const res2 = await fetch({
        url: apiMyFace,
        data: {
          baseData: 'https://n1image.hjfile.cn/res7/2020/01/30/8cb348fc7759f1709e2268d70dd7c676.jpg' //JSON.stringify(userImageBase64)
        }
      })
      console.log('res2 :', res2);
    } catch (error) {
      console.log('error :', error)
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

  assignPicChoosed() {
    if (this.state.bgPic) {
      this.setState({
        picChoosed: true
      })
    } else {
      this.setState({
        picChoosed: false
      })
    }
  }

  

  readURL = (h5Blob) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      console.log('e :', e);
      // updateResults();
    };
    console.log('h5Blob :', h5Blob);

    reader.readAsDataURL(h5Blob);
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
    const { videoStatus, bgPic } = this.state

    return (
      <PageWrapper>
        <Canvas canvasId='canvasHat' />
        <Button
          className="weui-btn"
          type="default"
          data-way="album"
          onClick={this.chooseImage}
        >
          相册选择
        </Button>
        <Button onClick={this.submitUpload}>上传</Button>
      </PageWrapper>
    )
  }
}

export default Index