---
title: 3.1 图片裁剪、模糊、保存、分享的技巧
---

> 本文所讲内容主要基于微信原生小程序和 Taro（多端统一开发解决方案）。如果使用Taro语法，那在微信原生小程序中写法也类似。

## 选择图片

```js
Taro.chooseImage({
  count: 1, // 选择数量
  sourceType: ['album', 'camera'], // 选择图片的来源
  sizeType: ['original', 'compressed'] // 所选的图片的尺寸
}).then(res => {
  this.setState({
    originSrc: res.tempFilePaths[0]
  });
}).catch(error => {
  console.log('error :', error);
})
```

在安卓手机上压缩效果不好，使用原图，然后图片裁剪时，再用canvas实现图片压缩的目的的效果更好。

也就是说，`sizeType`设置为`original`，在使用基于Canvas实现的图片裁剪来获取特定宽高的图片。


## 裁剪图片

在“我要戴口罩”小程序中的另一个痛点就是如果上传一个长方形图片，会被强行变成正方形。我就想如何裁剪出正方形图片呢，此时在 npmjs 仓库中发现了`taro-cropper`这个强大的图片裁剪插件（也可以在 Taro [物料市场](https://taro-ext.jd.com)找到）。


* 原生小程序侧：`wx-plugin/image-cropper`，功能强大，但使用起来较麻烦
* web端：`react-cropper`，下载量挺大，感觉应该好用
* Taro：使用 `taro-cropper`


```js
// originSrc 为Taro.chooseImage() 的图片路径
<View className='cropper-wrap' hidden={!originSrc}>
  <TaroCropper
    src={originSrc}
    cropperWidth={900}
    cropperHeight={900}
    ref={this.catTaroCropper}
    fullScreen
    fullScreenCss
    onCut={this.onCut}
    hideCancelText={false}
    onCancel={this.onCancel}
  />
</View>
```

![](https://n1other.hjfile.cn/res7/2020/03/29/2cd56a0e59154ae628ae5023cb4d0be6.PNG)

> 为何我把代码clone下来呢，因为我在跟 `Taro v3.0.0` 的新版本开发，在新版本中我是用React框架，就需要改进相应的写法啦。

## 图片压缩

在小程序上，主要使用 `wx.compressImage()` 来完成压缩，其在安卓上压缩效果也不是很好。此时，也有借助`canvas`进行压缩的。

```js
Taro.compressImage({
  src: tempFilePaths, // 图片路径
  quality: 10 // 压缩质量，最大为100
}).then(res => {
  console.log('图片路径 :', res.tempFilePaths);
}).catch(error => {
  console.log('error :', error);
})
```

而在Web端，只能用canvas来实现图片压缩，不过在Web端可以动态创建`canvas`，再进行压缩后可以将`canvas`元素给去除。


## 图片模糊

用canvas画图，其宽高是不支持缩放的。也就是，900x900大小的画布放在宽高为300x300的canvas上，也只会显示左上角的300x300的区域。
而将300x300的图片给2倍屏或3倍屏的手机上看，会显得格外的模糊。

此时，就需要两个元素，一个被定为到UI界面之外的canvas元素，一个是由canvas导出的大图Image。

```js
<Canvas className='canvas-mask' style={{ width: '900px', height:  '900px' }} canvasId='canvasMask' />
<Image className='poster-image' src={posterSrc} onClick={this.previewPoster} showMenuByLongpress />
```

```css
.canvas-mask {
  position: absolute;
  left: 0;
  top: -9999px;
}
```

> canvas元素不能设置为 `display:none`，否则就无法进行绘制了。

![](https://n1other.hjfile.cn/res7/2020/03/29/e234a8f4ccfa638fcf5797c46d7929c7.PNG)

## 分享给朋友

在上面的示意图中，你会发现“点击可预览大图，长按可以分享图片”这句提示语，这其实代表了两个方法的实现。


* `Taro.previewImage()` 点击图片预览图片
* `showMenuByLongpress` 长按图片，开启长按图片显示识别小程序码菜单，其中就包含了“发送给朋友”这一选项。

```js
<Image
  className='poster-image'
  src={posterSrc}
  onClick={this.previewPoster}
  showMenuByLongpress
/>

// 预览图片
previewPoster = () => {
  const { posterSrc } = this.state
  if (posterSrc !== '') Taro.previewImage({ urls: [posterSrc] })
}
```

而要实现“分享给朋友”，就需要设置页面分享方法，并在按钮上绑定对应生成好的海报了。

```html
<!-- 按钮点击 -->
<Button
  className='poster-btn-share'
  openType='share'
  data-poster-src={posterSrc}
>
  发送给朋友
</Button>
```
```js
// 页面分享方法
onShareAppMessage({ from, target }) {
  const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/02/02/a374bb58c4402a90eeb07b1abbb95916.png'

  let shareImage = DEFAULT_SHARE_COVER
  let shareUrl = '/pages/queen-king/queen-king'
  if (from === 'button') {
    const { dataset = {} } = target
    const { posterSrc = '' } = dataset
    if (posterSrc) {
        shareImage = posterSrc
      }

  }
  return {
    title: '给女神戴上皇冠吧！',
    imageUrl: shareImage,
    path: shareUrl
  }
}
```