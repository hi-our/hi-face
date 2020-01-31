import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import fetch from 'utils/fetch'
import { apiAnalyzeFace } from 'constants/apis'
import { getSystemInfo } from 'utils/common'
import { getHatInfo, getBase64Main } from 'utils/face-utils'
import { drawing } from 'utils/canvas-drawing'

import { NOT_FACE, ONE_FACE } from 'constants/image-test'

const imageData = ONE_FACE

import './styles.styl'

const { windowWidth } = getSystemInfo()
const CANVAS_SIZE = parseInt(windowWidth * 0.9, 10) + 'px'

// @CorePage
class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
    // navigationStyle: 'custom'
  }

  componentDidMount() {
    this.testFetch()
  }

  testFetch = async () => {
    let testImg = 'https://n1image.hjfile.cn/res7/2020/01/31/85a57f8e140431329c0439a00e13c1a0.jpeg'
    try {
      const res2 = await fetch({
        url: apiAnalyzeFace,
        type: 'post',
        data: {
          Image: getBase64Main(imageData),
          Url: testImg,
          Mode: 1,
          FaceModelVersion: '3.0'
        }
      })


      
      console.log('test getHatInfo:');
      const info = getHatInfo(res2)
      drawing(this.canvasRef, {
        info,
        imgSrc: imageData,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      })

      
    } catch (error) {
      console.log('test error draw :');
      drawing(this.canvasRef, {
        imgSrc: testImg,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      })
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
      <View>
        2
        <Canvas canvasId='canvasHat' id='canvasHat' style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }} />
        {/* <Button
          className="weui-btn"
          type="default"
          data-way="album"
          onClick={this.chooseImage}
        >
          相册选择
        </Button>
        <Button onClick={this.submitUpload}>上传</Button> */}
      </View>
    )
  }
}

export default Index