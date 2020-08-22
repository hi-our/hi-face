import Taro, { Component } from '@tarojs/taro'
import { View, Image, Canvas } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch'
import { getHatInfo  } from 'utils/face-utils'
import { drawing, drawHat, getBase64Main, getImg } from 'utils/canvas-drawing'
import { fillText } from 'utils/canvas'

const isH5Page = process.env.TARO_ENV === 'h5'

const testImg = 'https://image-hosting.xiaoxili.com/img/20200812134029.png'
const imageData = testImg

import './styles.styl'

const CANVAS_SIZE = '300px'

class Index extends Component {
  config = {
    navigationBarTitleText: '圣诞帽测试页',
  }

  componentDidMount() {
    this.testFetch()
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://image-hosting.xiaoxili.com/img/20200812132355.png'

    return {
      title: '测试页-AI圣诞帽',
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

  render () {
    return (
      <View>
        <View>自动戴圣诞帽：</View>
        <Canvas canvasId='canvasHat' ref={r => this.canvasRef = r} style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }} />
        <View>原图：</View>
        <Image src={imageData} style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}></Image>
      </View>
    )
  }
}

export default Index