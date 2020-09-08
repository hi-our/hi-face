---
title: 4.3 通过五官分析实现为人脸佩戴贴纸
---

知识点

* 600px与600rpx的快速转换 
* 腾讯云五官分析服务
* 确认出圣诞帽或口罩的位置
* 补充：`face-api` 达到纯前端的人脸识别


启发我做这个小程序的是这两个文章，《[「圣诞特辑」纯前端实现人脸识别自动佩戴圣诞帽](https://juejin.im/post/5e02b73fe51d455807699b1f)》和《[我要戴口罩 – 为微信、微博等社交网络头像戴口罩](https://www.appinn.com/woyaodaikouzhao-wechat-miniapp/)》。

## 600px与600rpx的快速转换

Hi头像小程序制作的头像宽高为600px。在小程序中头像贴纸元素都用的`rpx`为单位，而刚好的就是 600rpx 对应 600px，所有元素都等比缩放即可。也就是说，View元素宽高为600rpx，而头像是600rpx，那么头像上的贴纸的单位也都为rpx。

> rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。规定屏幕宽为750rpx。如在 iPhone6 上，屏幕宽度为375px，共有750个物理像素，则750rpx = 375px = 750物理像素，1rpx = 0.5px = 1物理像素。

## 腾讯云的五官分析服务

在 [项目搭建-腾讯云环境配置及特色人工功能介绍](3-knowledge-preparation/2-tencent-cloud-ai-face.md)一文中，已经了解了五官分析接口如何调用。

```js
// taro/src/utils/image-analyze-face.js
c/**
 * 五官分析
 * @param {string} base64Main
 */
export const imageAnalyzeFace = async (base64Main) => {
  try {
    const res = await wx.serviceMarket.invokeService({
      service: 'wx2d1fd8562c42cebb',
      api: 'analyzeFace',
      data: {
        Action: 'AnalyzeFace',
        Image: base64Main
      },
    })

    let data = getResCode(res)
    return data
  } catch (error) {
    console.log('error :', error)
    throw error
  }
}
```

接口示意

```json
{
  "Response": {
    "ImageWidth": 600,
    "ImageHeight": 600,
    "FaceShapeSet": [
      {
        "FaceProfile": [],
        "LeftEye": [],
        "RightEye": [],
        "LeftEyeBrow": [],
        "RightEyeBrow": [],
        "Mouth": [],
        "Nose": [],
        "LeftPupil": [],
        "RightPupil": []
      }
    ],
    "RequestId": ""
  }
}
```

对请求图片进行五官定位（也称人脸关键点定位），计算构成人脸轮廓的 90 个点，包括眉毛（左右各 8 点）、眼睛（左右各 8 点）、鼻子（13 点）、嘴巴（22 点）、脸型轮廓（21 点）、眼珠[或瞳孔]（2点）。

`FaceShapeSet` 五官定位（人脸关键点）具体信息。
| 名称 | 描述 |
|---|---|
| FaceProfile | 描述脸型轮廓的 21 点。| 
| LeftEye | 描述左侧眼睛轮廓的 8 点。| 
| RightEye | 描述右侧眼睛轮廓的 8 点。| 
| LeftEyeBrow | 描述左侧眉毛轮廓的 8 点。| 
| RightEyeBrow | 描述右侧眉毛轮廓的 8 点。| 
| Mouth | 描述嘴巴轮廓的 22 点。| 
| Nose | 描述鼻子轮廓的 13 点。| 
| LeftPupil | 左瞳孔轮廓的 1 个点。| 
| RightPupil | 右瞳孔轮廓的 1 个点。| 


## 圣诞帽或皇冠定位
核心：如何算出额头宽度和额头中间位置？

在《[「圣诞特辑」纯前端实现人脸识别自动佩戴圣诞帽](https://juejin.im/post/5e02b73fe51d455807699b1f)》（下文提交为圣诞帽文章）一文中详细地讲解了如何定位。


圣诞帽文章中绘制圣诞帽的目标是canvas。

而我的效果有两种，
1. 宽高均为600rpx的`view`元素上，以便后续的图形贴纸位置移动
2. 在图形贴纸位置确认后，再绘制到 `canvas` 上（后文中会介绍）


### 图形贴纸的 `View` 定位

* `faceWidth` 脸部宽度：与圣诞帽文章相同 `getFaceWith`
* `angle` 脸部旋转角度：与圣诞帽文章相同 `getFaceRadian`
* `headPos`头顶中心点：与圣诞帽文章相同 `getHeadPos`


```js
// 代码有精简
export function getHatShapeList(mouthList, shapeItem) {
  const { _id: shapeId } = shapeItem || {}
  return mouthList.map(item => {
    let { faceWidth, angle, headPos = {} } = item

    const shapeCenterX = headPos.X
    const shapeCenterY = headPos.Y
    const rotate = angle / Math.PI * 180

  
    // 角度计算有点难
    let widthScaleDpr = Math.sin(Math.PI / 4 - angle) * Math.sqrt(2) * faceWidth
    let heightScaleDpr = Math.cos(Math.PI / 4 - angle) * Math.sqrt(2) * faceWidth

    const resizeCenterX = shapeCenterX + widthScaleDpr - 2
    const resizeCenterY = shapeCenterY + heightScaleDpr - 2

    const shapeWidth = faceWidth / 0.6

    return {
      // 图形id
      shapeId,
      // 图形宽度
      shapeWidth,
      // 图形中间位置 X 轴
      shapeCenterX,
      // 图形中间位置 Y 轴
      shapeCenterY,
      // 旋转操作时的 X 轴的相对位置
      resizeCenterX,
      // 旋转操作时的 Y 轴的相对位置
      resizeCenterY,
      // 旋转角度
      rotate,
      // 水平翻转，正向为1，反向为-1
      reserve: 1
    }
  })
}
```
```js
// 单个图形在view上的位置，transX、transY与 translateHat 有类似的逻辑
// 在 JSX 中的代码
let transX = shapeCenterX - shapeWidth / 2 - 2 + 'rpx'
let transY = shapeCenterY - shapeWidth / 2 - 2 + 'rpx'

let shapeStyle = {
  width: shapeWidth + 'rpx',
  height: shapeWidth + 'rpx',
  transform: `translate(${transX}, ${transY}) rotate(${rotate + 'deg'})`,
  zIndex: shapeIndex === currentShapeIndex ? 2 : 1
}
```

差异点为圣诞帽文章上有以下两点
* 圣诞帽文章中用了 `translateHat` 来修改位置，而我这里也用`shapeCenterX - shapeWidth / 2 - 2 + 'rpx'`这样的方式来重新确认圣诞帽的左上角。
* 圣诞帽文章中特别计算了圣诞帽可以戴的范围，但我这里的贴纸都是宽高均为 300px 的图形，我在确认好确认好脸部宽度、旋转角度及头顶中心位置后，圣诞帽的具体偏移位置是我在设计软件中慢慢拖动看效果的。原因是有多个圣诞帽，挨个计算可戴区域会特别麻烦。

![](https://p1.music.126.net/HzEKubgpYXU4Mn7uip0ffg==/109951164575991535.png?imageView&thumbnail=600x600)

```js
// 0.7 为可戴区域占总区域的比重（为了让帽子更大一点，选择 0.6），0.65 是图片的宽高比
const picSize = { width: faceWidth / 0.6, height: (faceWidth * 0.65) / 0.6 };
```

当然，在戴口罩源码中用的确认好脸部宽度后，用 `scale` 进行的方法或缩小操作。但CSS 的 `transform` 会影响内部所有元素的代销，所以我还是直接计算出 `shapeWidth`，虽然这样反复操纵 width 对渲染效果来说不太好，但这样更容易理解。

![](https://n1image.hjfile.cn/res7/2020/05/30/6cef2d82bc1879694cc9993fd015dd35.png)


## 口罩定位

* `faceWidth` 脸部宽度：与圣诞帽文章相同 `getFaceWith`
* `angle` 脸部旋转角度：与圣诞帽文章相同 `getFaceRadian`
* `mouthMidPoint` 嘴巴中心点：与圣诞帽文章相同 `getMidPoint`



```js
const { leftPoint, rightPoint } = getMouthLeftRigthPoint(mouthPoint)
const mouthMidPoint = getMidPoint(leftPoint, rightPoint)
```


## 补充：face-api达到纯前端的人脸识别

在“自动佩戴圣诞帽”中，使用的方案是纯前端的 face-api，想放到小程序中就会有如下几个小问题：

- face-api 的识别模型有 5M 大小还多，即使纯前端加载，也显得比较大。而小程序的 canvas 与 web 网页中的还是有差异的，没法直接用 face-api。
- face-api 放在 nodejs 上加载，还需要配合`tensorflow`和`canvas`模拟。实际实现后发现，图片识别过程还是比较慢的（图片上传后、获取图片内容、识别五官位置、返回五官数据），容易让接口请求发生超时的情况。
