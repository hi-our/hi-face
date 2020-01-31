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
import { apiAnalyzeFace } from 'constants/apis'
import { getHatInfo } from 'utils/face-utils'
import { getSystemInfo } from 'utils/common'
import { drawing } from 'utils/canvas-drawing'

import HatImg from '../../images/hat.png'

const UN_LOGIN_HBG = 'https://n1image.hjfile.cn/res7/2019/11/22/cdaeb242a862231ca221e7da300334b4.png'

const imageData = 'data:image/png;base64,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'

import './styles.styl'

const { windowWidth } = getSystemInfo()
const CANVAS_SIZE = parseInt(windowWidth * 0.9, 10) + 'px'

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
  }

  testFetch = async () => {
    let testImg = 'https://n1image.hjfile.cn/res7/2020/01/31/4047a9202dd0bc5ff70b31d02ece0048.jpeg'
    try {
      const res2 = await fetch({
        url: apiAnalyzeFace,
        type: 'post',
        data: {
          // Image: imageData,
          Url: testImg,
          Mode: 1,
          FaceModelVersion: '3.0'
        }
      })

      

      const info = getHatInfo(res2)
      drawing(this.canvasRef, {
        info,
        imgSrc: testImg,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      })

      
    } catch (error) {
      console.log('error :', error);
    }
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
        url: apiAnalyzeFace,
        data: {
          baseData: 'https://n1image.hjfile.cn/res7/2020/01/30/8cb348fc7759f1709e2268d70dd7c676.jpg' //JSON.stringify(userImageBase64)
        }
      })
      console.log('res2 :', res2);
    } catch (error) {
      console.log('error :', error)
    }
  }
  

  loginBtnClick = () => {
    // this.loginBtn.login()
  }
  switchBtnClick = () => {
    this.loginBtn.login({
      type: 'switch'
    })
  }





  render () {
    return (
      <PageWrapper>
        <Canvas canvasId='canvasHat' id='canvasHat' style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }} />
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