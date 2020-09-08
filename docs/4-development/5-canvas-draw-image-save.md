---
title: 4.5 头像绘制和图片保存弹窗
---

知识点

* 设置 canvas 元素和生成的头像图片元素
  * 绘制头像的 canvas 画布
  * 导出头像图片的画布
* 头像弹窗
  * 预览图片
  * 长按图片可分享给朋友
  * 保存图片
  * 分享给朋友


## 设置 canvas 元素和生成的头像图片元素
在《[通过五官分析实现为人脸佩戴贴纸](4-development/3-analyze-face-shape.md)》中，我提及了借助 `rpx`单位巧妙来完成图形布局和移动。在用户需要保存图片时，需要借助canvas来合成图片。

直观的理解是，需要宽高为600px的图片，那就在直接展示给用户一个600px宽的canvas，但其实不这么简单。

我们需要一个“隐藏”的宽高为 600px 的 `canvas` 画布来完成，最后生成一个我们所需的头像图片。

```jsx
/* canvas 隐藏画板 */
<Canvas className='canvas-shape' style={{ width: '6px', height: '600px' }} canvasId='canvasShape' />

// 生成好的图片，图片路径为 posterSrc
<Image className='poster-image' src={posterSrc} onClick={this.previewPoster} showMenuByLongpress />
```

```css
.canvas-shape {
  position: absolute;
  left: 0;
  top: -9999px;
}
```

注意点：

* 与 “Web 端支持canvas动态创建”不同的是，小程序必须提前创建好 `canvas` 元素
* 小程序上的canvas不可以设置为 `display:none`，设置后，画布并不会被绘制出来
* 在小程序上，canvas元素并不支持缩放，也就是，600px的宽高会被小程序边缘裁减掉只剩下屏幕宽度

### 绘制头像的 canvas 画布

> 请仔细看代码中的注释

```js
// 生成图片宽高为600px
const SAVE_IMAGE_WIDTH = 600

// 绘制 canvas
drawCanvas = async () => {
  // cutImageSrc 裁剪后的头像底图
  // shapeList 图形列表
  const { cutImageSrc, shapeList } = this.state

  // 获取 canvas 的 context
  const pc = Taro.createCanvasContext('canvasShape')

  // 清空画布
  pc.clearRect(0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)

  // getImg 获取图片，注意获取图片在小程序与Web端的不同
  let tmpCutImage = await getImg(cutImageSrc)
  // 绘制裁剪后的头像底图
  pc.drawImage(tmpCutImage, 0, 0, SAVE_IMAGE_WIDTH, SAVE_IMAGE_WIDTH)

  // 遍历列表，绘制图形贴纸
  for (let index = 0; index < shapeList.length; index++) {
    // 保存绘图上下文
    pc.save()

    // 获取贴纸的细节
    const {
      // 图形宽
      shapeWidth: shapeSize,
      // 旋转角度
      rotate,
      // 图形中心点 X轴
      shapeCenterX,
      // 图形中心点 Y轴
      shapeCenterY,
      // 图形正向图片地址
      imageUrl,
      // 图形反向图片地址
      imageReverseUrl,
      // 是否旋转
      reserve: isReserve,
    } = shapeList[index]

    // 移动到图形中心
    pc.translate(shapeCenterX, shapeCenterY)
    // 旋转画布角度
    pc.rotate((rotate * Math.PI) / 180)

    // 获取图形地址
    let oneImgSrc = await getImg(isReserve < 0 ? (imageReverseUrl || imageUrl) : imageUrl)

    // 绘制贴纸
    pc.drawImage(
      oneImgSrc,
      -shapeSize / 2,
      -shapeSize / 2,
      shapeSize,
      shapeSize
    )

    // 恢复之前保存的绘图上下文
    pc.restore()
  }

  // 绘制图形到画布上
  pc.draw(false, () => {
    // 绘制完要继续完成的操作
  })
}
```

注意点

1、小程序上的 `drawImage` 所要绘制的图片资源（网络图片要通过 `getImageInfo` / `downloadFile` 先下载），所以我封装了一个 `getImg` 方法来完成这个操作

```js
/**
 * 获取图片
 * @param {*} src 图片地址
 */
export const getImg = async (src) => {
  // web端 获取图片Image元素
  if (isH5Page) {
    let image = await getH5Image(src)
    return image
  }

  // 将base64存储为本地路径
  if (src.includes(';base64,')) {
    return await base64src(src)
  }

  try {
    // 将网络图片转换为本地路径
    const res = await Taro.getImageInfo({
      src,
    })
    return res.path
    
  } catch (error) {
    console.log('error :', error);
    throw error
    
  }
}
```

2、在 iPhone手机上，canvas绘制图片不支持水平翻转，这里需要正向和反向的两个图片
```js
let oneImgSrc = await getImg(isReserve < 0 ? (imageReverseUrl || imageUrl) : imageUrl)
```


### 导出头像图片的画布

```js
pc.draw(false, () => {
  Taro.canvasToTempFilePath({
    canvasId: 'canvasShape',
    x: 0,
    y: 0,
    height: SAVE_IMAGE_WIDTH * 3,
    width: SAVE_IMAGE_WIDTH * 3,
    // 图片类型
    fileType: 'jpg',
    // 压缩质量
    quality: 0.9,
    success: async (res) => {

      // 保存图片到云数据库
      await this.onSaveImageToCloud(res.tempFilePath)

      Taro.hideLoading()
      // 设置海报图片
      this.setState({
        posterSrc: res.tempFilePath
      }, () => {
        // 展示海报弹窗
        this.posterRef.onShowPoster()
      })

    },
    fail: () => {
      Taro.hideLoading()
      Taro.showToast({
        title: '图片生成失败，请重试'
      })
    }
  })
})
```

至此，头像图片的临时路径已经被保存到 `posterSrc` 变量中，并且可以在头像弹窗中展示出来。

## 头像弹窗


将 `posterSrc`展示到弹窗中有如下原因

* 弹窗内的逻辑相对独立
* 可以关闭弹窗后再继续编辑头像上的贴纸图形的位置

![](https://n1image.hjfile.cn/res7/2020/05/31/d0a8a773ac6245117e0077f7846abaf1.png)



```js
render(){
    const { isShowPoster } = this.state
    const { posterSrc, isH5Page, forCheck } = this.props

    return (
      <View className={`poster-dialog ${posterSrc && isShowPoster ? 'show' : ''}`}>
        <View className='poster-dialog-main'>
          {!!posterSrc && <Image className='poster-image' src={posterSrc} onClick={this.previewPoster} showMenuByLongpress></Image>}
          <View className='poster-image-tips'>点击可预览大图，长按可分享图片</View>
          <View className='poster-dialog-close' onClick={this.onHidePoster} />
          <View className='poster-footer-btn'>
            <View className='poster-btn-save' onClick={this.savePoster}>
              保存到相册
            </View>
            <Button className='poster-btn-share' openType='share' data-poster-src={posterSrc}>
              分享给朋友
            </Button>
          </View>
        </View>

      </View>
    )
  }
```

### 预览图片
在小程序内查看图片基本上都小于 `375px`，所以预览宽高为600px的图片还是需要预览图片。

```js
previewPoster = () => {
  const { posterSrc } = this.props
  if (posterSrc !== '') Taro.previewImage({ urls: [posterSrc] })
}
```

### 长按图片可分享给朋友
微信小程序上分享图片只能分享页面，并不能直接分享图片。那如何做到呢？那就是长按图片后的菜单上有“发送给朋友”的选项。

```jsx
<Image className='poster-image' src={posterSrc} onClick={this.previewPoster} showMenuByLongpress></Image>
```
![](https://n1image.hjfile.cn/res7/2020/05/31/0a9b0ca4e3413e6e63d76282e4083722.png)

### 保存图片
其实这里的保存图片才是真正将图片保存到相册内。

```js
savePoster = () => {
  const { posterSrc } = this.props

  if (posterSrc) {
    this.saveImageToPhotosAlbum(posterSrc)
  }
}
```


### 分享给朋友
分享给朋友时，也是有注意点的。在微信小程序“…”菜单上分享的是挡墙页面，而分享弹窗上其实触发分享的页面是头像分享页。

```js
onShareAppMessage({ from, target }) {
  const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/04/26/2041af2867f22e62f8fce32b29cd1fb0.png'
  const { themeData } = this.state
  let { shareImage = DEFAULT_SHARE_COVER, shareTitle = '给女神戴上皇冠吧！' } = themeData

  let shareUrl = '/pages/avatar-edit/avatar-edit'
  if (from === 'button') {
    const { dataset = {} } = target
    const { posterSrc = '' } = dataset

    console.log('posterSrc :', posterSrc);

    if (posterSrc) {
      shareImage = posterSrc
      const { shareUUID } = this.state
      if (shareUUID) {
        shareUrl = `/pages/avatar-poster/avatar-poster?uuid=${shareUUID}`
      }
    }

  }

  console.log('shareUrl :', shareUrl);
  return {
    title: shareTitle,
    imageUrl: shareImage,
    path: shareUrl
  }
}
```

## Taro 补充知识点
如果你的图片是放在 `images` 文件夹内的，那在 Taro 项目中，canvas 画图的`drawImage(src, 0, 0, 300, 300)`方法中 图片 src 为`require('../../images/xxx.png')`的话，一定要记住修改以下配置，否则小程序就会报 http `500`错误。

```js
{
  mini: {
    imageUrlLoaderOption: {
      limit: 0
    }
}
```