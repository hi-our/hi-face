---
title: 4.1.1 上篇：借助云存储和图像处理扩展人脸智能裁剪
---

> 原生小程序编写由李欢负责，Taro版本由小溪里负责，校对由盛瀚钦完成。

本篇知识点：
* UI布局
* 选择图片
* 图片上传到云存储
* 人脸智能裁剪


目标为在选择图片后，将图片上传到云存储，再获取图片的临时路径，提供数据万象拼接参数的方式来获取人脸智能裁剪的效果。

> 关于对数据万象的理解，可以参看《[云开发扩展能力](../3-knowledge-preparation/5-image-extension-introduction.md)》

### UI布局

为了在人脸五官分析识别时图片不超过1M大小，以及整体布局还可以的情况下，我将宽高设置为600px * 600px，
页面对应显示的地方也是600rpx * 600rpx，但我还是会根据屏幕尺寸来换算成实际等比缩放后的像素值。
> 在 `rpx`作为[尺寸单位](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html#%E5%B0%BA%E5%AF%B8%E5%8D%95%E4%BD%8D)时，与后续图形移动时`touch`事件中的单位`px`还需要重新对应，所以这里不选用rpx作为显示单位。
> 在没有`touch`事件的情况下，只是单纯显示人脸框的位置（如人脸识别的场景），是可以直接将 `600px` 的图片直接放在 `600rpx` 的空间内的。

![](https://n1image.hjfile.cn/res7/2020/05/05/05908e268c8d2dba8c46ef15a0e9cb13.png)

### 选择图片
在选择图片方面，支持从相册、相机、用户头像上获取。

**相册、相机**

```js
Taro.chooseImage({
  count: 1, // 选择数量
  sourceType: ['album', 'camera'], // 选择图片的来源
  sizeType: ['original', 'compressed'] // 所选的图片的尺寸
}).then(res => {
  this.setState({
    originSrc: res.tempFilePaths[0]
  })
}).catch(error => {
  console.log('error :', error);
})
```

这里面的图片压缩（`compressed`）在安卓手机上压缩效果不好，图片体积并没有减少很多。

替代方案是，选择原图后，使用基于Canvas的图片裁剪插件进行裁剪，再导出时可以设置图片输出质量（Canvas的特性）。

**用户头像**

1. 在小程序下载合法域名添加 `http://wx.qlogo.cn/`
2. 设置 `Button` 的`openType`为`getUserInfo`
3. 在其回调方法中获取到用户头像并继续接下来的操作

在云开发挑战赛中，多位参赛者反馈说，Button无法重新写样式，那我这里给出上图中“使用相机”的wxml与wxss的示例代码。

```html
<Button className="button-avatar" type="default" data-way="avatar" openType="getUserInfo" onGetUserInfo={this.onGetUserInfo}>使用头像</Button>
```

```css
.button-avatar {
  font-size: 24rpx;
  line-height: 1.25;
  padding: 20rpx;
  margin: 0 20rpx;
  background: transparent!important;
}

.button-avatar:before{
  content:'';
  display: block;
  margin: 0 auto 6rpx;
  width: 60rpx;
  height: 60rpx;
  background: url(https://n1image.hjfile.cn/res7/2020/02/13/e3c3acc4b66e3715eb59ebc9625527bf.png) no-repeat center/contain
}
```

> 为何我会将按钮的背景色强行设置为透明色呢？button-hover 默认为`{background-color: rgba(0, 0, 0, 0.1); opacity: 0.7;}`



### 图片上传云存储
接下来就是将图片上传到云存储，这里注意的是可以将图片放到不同的文件夹中。

路径（`cloudPath`）设置：文件夹、原图、随机数（或由`uuid()`生成）、时间。

```js
let uploadParams = {
  cloudPath: `${prefix}-${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.jpg`, // 随机图片名
}
```

### 人脸智能裁剪

将图像进行缩放及裁剪，有两种方法进行。一种是小程序侧借助小程序图片裁剪插件（如 `image-cropper`）让用户自己手动裁剪，而另一种就是借助数据万象中[裁剪](https://cloud.tencent.com/document/product/460/36541)来自动完成图片裁剪。

![](https://n1image.hjfile.cn/res7/2020/05/05/9f3de946789523a606250ad086b69770.jpg)

如，原图为2160x2880的1Mb大小的图片，而在小程序显示时只需要宽高为600x600的图片即可（图片大小会降为70Kb）。裁剪效果如下图：

![](https://n1image.hjfile.cn/res7/2020/04/12/56ed9b6e34415129deefc3ba6463c865.jpg)

参考代码如下：

```js
// 获取图片临时链接
const getImageUrl = async (fileID) => {
  const { fileList } = await tcb.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}

let originImageUrl = await getImageUrl(fileID)

let rule = `imageMogr2/thumbnail/!${width}x${height}r|imageMogr2/scrop/${width}x${height}/`

return  cutImageUrl = originImageUrl + '?' + rule
```

图片缩放及裁剪的核心就是`rule`，这里我执行了两项操作

1. `/thumbnail/!600x600r/`，将图片缩放为宽高中的小边为600px（`限定缩略图的宽度和高度的最小值分别为 Width 和 Height，进行等比缩放`）
2. `/scrop/600x600`，将图片的人脸部分裁剪出来（`基于图片中的人脸位置进行缩放裁剪。目标图片的宽度为 Width、高度为 Height`）

> 如果人脸智能裁剪不奏效的话，也可以用`/crop/600x600/center`，将图片居中裁剪。

完整的使用示例，请参照 https://github.com/hi-our/hi-face/blob/1.x-stable/cloud/functions/detect-face/index.js
