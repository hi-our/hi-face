import Taro, { Component } from '@tarojs/taro'
import { View, Image, Input, Button, Canvas } from '@tarojs/components'
// import PageWrapper from 'components/page-wrapper'
import fetch, { cloudCallFunction } from 'utils/fetch'
import { apiAnalyzeFace } from 'constants/apis'
import { getSystemInfo } from 'utils/common'
import { getHatInfo  } from 'utils/face-utils'
import { drawing, drawHat, getBase64Main, getImg } from 'utils/canvas-drawing'
import { fillText } from 'utils/canvas'

import { NOT_FACE, ONE_FACE } from 'constants/image-test'
// 引入代码
// import { TaroCanvasDrawer,  } from 'components/taro-plugin-canvas';

const isH5Page = process.env.TARO_ENV === 'h5'

const testImg = 'https://n1image.hjfile.cn/res7/2020/01/31/85a57f8e140431329c0439a00e13c1a0.jpeg'
const imageData = ONE_FACE

import './styles.styl'

const { windowWidth } = getSystemInfo()
const CANVAS_SIZE = '300px'

// @CorePage
class Index extends Component {
  config = {
    navigationBarTitleText: '圣诞帽测试页',
    // navigationStyle: 'custom'
  }

  constructor(props) {
    super(props)
    this.state = {
      canvasDrawerConfig: null
    }
  }



  componentDidMount() {
    this.testFetch()
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

    return {
      title: 'AI圣诞帽',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/test/test'
    }
  }
  testFetch = async () => {
    
    // console.log('imageData :', imageData);
    try {
      const res2 = await cloudCallFunction({
        name: 'analyze-face',
        data: {
          base64Main: getBase64Main(imageData)
        }
      })

      const hatList = getHatInfo(res2)
      console.log('hatList :', hatList);

      // Taro.getImageInfo({
      //   src: imageData
      // }).then(res => {
      //   console.log('res imginfo :', res);
      // })
      const ctx = Taro.createCanvasContext('canvasHat', this)
      console.log('ctx :', ctx);
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      fillText(ctx, ' ', 55, 233, false, 12, '#687583')
      
      // drawing(this.canvasRef, {
      //   info,
      //   imgSrc: imageData,
      //   width: CANVAS_SIZE,
      //   height: CANVAS_SIZE,
      // })

      let OneImgTest = require('../../images/one_face.jpeg')
      const imgSrcTransform = isH5Page ? await getImg(OneImgTest) : OneImgTest
      // console.log('imgSrcTransform :', imgSrcTransform);
      console.log('图片加载完 :', CANVAS_SIZE);
      ctx.drawImage(imgSrcTransform, 0, 0, 300, 300)
      for (let index = 0; index < hatList.length; index++) {
        console.log('index :', index);
        const hatInfo = hatList[index];
        await drawHat(ctx, hatInfo);
      }
      console.log('10 :', 10);
      // ctx.save()
      ctx.draw(true)


      
    } catch (error) {
      console.log('test error draw :');
      drawing(this.canvasRef, {
        imgSrc: imageData,
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

  onCanvasCreateSuccess = (result) => {
    const { tempFilePath, errMsg } = result;
    console.log('tempFilePath :', tempFilePath);
    Taro.hideLoading();
    if (errMsg === 'canvasToTempFilePath:ok') {
      this.setState({
        shareImage: tempFilePath,
        // 重置 TaroCanvasDrawer 状态
        canvasStatus: false,
        canvasDrawerConfig: null
      })
    } else {
      // 重置 TaroCanvasDrawer 状态
      this.setState({
        canvasStatus: false,
        canvasDrawerConfig: null
      })
      Taro.showToast({ icon: 'none', title: errMsg || '出现错误' });
      console.log(errMsg);
    }
  }
  onCanvasCreateFail = (result) => {
    console.log('result :', result);
  }

  render () {
    const { shareImage, canvasDrawerConfig } = this.state
    return (
      <View>
        <View>自动戴圣诞帽：</View>
        <Canvas canvasId='canvasHat' ref={r => this.canvasRef = r} style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }} />
        <View>原图：</View>
        <Image src={imageData} style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}></Image>
        {/* <View>TaroCanvasDrawer效果，但不够智能</View> */}
        {/* {!!canvasDrawerConfig && (
          <TaroCanvasDrawer
            config={canvasDrawerConfig}
            onCreateSuccess={this.onCanvasCreateSuccess}
            onCreateFail={this.onCanvasCreateFail}
          />
        )} */}
        {/* <Image className='image-poster' src={shareImage} /> */}
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