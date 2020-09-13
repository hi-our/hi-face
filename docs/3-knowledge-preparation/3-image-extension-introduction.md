---
title: 3.2 云开发图像处理的使用方法
---
腾讯云云开发（CloudBase）有几项非常实用的[扩展能力](https://docs.cloudbase.net/extension/introduce.html)，包含图像标签、图像安全审核、图像处理、图片盲水印。

本次，我就将借助云开发扩展能力来完成人脸识别的小程序。

![](https://n1image.hjfile.cn/res7/2020/04/12/9cd41ecbf9d287661512af1060bf2039.jpg)


## 云开发扩展能力介绍

云开发扩展能力是云开发团队为开发者提供的一站式云端服务，旨在降低开发者使用云服务的门槛，助力开发者快速开发应用。

|名称|具体功能|
|:----:|:----|
| 图像处理 | 图像处理提供多种图像处理功能，包含智能裁剪、无损压缩、水印、格式转换等，您可通过扩展 SDK 轻松管理文件。 | 
| 图像安全审核 | 图像安全审核提供鉴黄、鉴政、鉴暴恐等多种类型的敏感内容审核服务，有效识别违禁图片，规避违规风险。 | 
| 图像盲水印 | 盲水印功能将水印图以不可见的形式添加到原图信息中，不会对原图质量产生太大影响。在图片被盗取后，您可对疑似被盗取的资源进行盲水印提取，验证图片归属。 | 
| 图像标签 | 图标标签对云存储中存量数据的图片标签识别，返回图片中置信度较高的主题标签，帮忙开发者分析图像。 | 


### 使用方法简述
完整的文档：https://docs.cloudbase.net/extension/introduce.html

* 打开 [云开发扩展控制台](https://console.cloud.tencent.com/tcb/add)；
* 选择希望安装的扩展；
* 单击【安装】，进行扩展程序的安装；
* 等待扩展程序安装完成即可使用。
* 在云函数中或 客户端安装`@cloudbase/extension-ci`，并使用对应的tcb sdk来调用扩展（如 `"@cloudbase/js-sdk`或`@cloudbase/node-sdk`）

> PS：可将云函数超时时间调整为10秒以上，因为运行扩展和腾讯云特色人工智能服务（如人脸识别）可能会超过默认的3秒超时时间。


### 扩展能力与数据万象的关系

图像类的扩展能力，需先上传图片到云存储，再调用扩展能力（使用了数据万象）处理图片，然后将图片上传到云存储。

数据万象（Cloud Infinite，CI）是腾讯云为客户提供的专业一体化的图片解决方案，涵盖图片上传、下载、存储、处理、识别等功能，将 QQ 空间相册积累的十年图片服务运作经验开放给开发者。目前有图片处理、原图保护、跨域访问设置、样式预设等功能。

```js
// 图像处理示例代码
tcb.init({
  env: "您的环境ID"
});
tcb.registerExtension(extCi);

async function process() {
  try {
    const opts = {
      rules: [
        {
          // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
          fileid: "/image_process/demo.jpeg",
          rule: "imageView2/format/png" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        }
      ]
    };
    const res = await tcb.invokeExtension("CloudInfinite", {
      action: "ImageProcess",
      cloudPath: "demo.jpeg", // 存储图像的绝对路径，与tcb.uploadFile中一致
      fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
      operations: opts
    });
    console.log(JSON.stringify(res.data, null, 4));
  } catch (err) {
    console.log(JSON.stringify(err, null, 4));
  }
}
```
通过上述代码，我们可以得出以下简略步骤

1. 图片需要上传到云存储上，获取 `fileID` 
2. 从 `fileID` 中截取出 `cloudPath`，即存储图像的绝对路径
3. 调用扩展能力（如上面代码中的图像处理），根据设置的选项（`operations: {rules: []}`）来完成对图像的处理
4. 将处理后的图片保存到云存储上

那么问题来了，如果我只是想将图片裁剪后展示到小程序上而不想将图片上传到云存储上该如何操作呢？

1. 通过fileID获取图片的临时地址（需要安装图象处理扩展，并开启所有人可读、创建者读写权限）
2. 通过在图片链接后面拼接 `rule` 即可得到所需要的图片。

> `rule` 的中 `|` 是数据万象的管道操作符，能够实现对图片按顺序进行多种处理。用户可以通过管道操作符将多个处理参数分隔开，从而实现在一次访问中按顺序对图片进行不同处理。目前支持大小在20M以内、长宽小于9999像素的图片处理。目前最多支持三层管道。

```js
// 获取图片临时链接
const getImageUrl = async (fileID) => {
  const { fileList } = await tcb.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}

// 拼接图片地址
let originImageUrl = await getImageUrl(fileID)
let rule = `imageMogr2/thumbnail/!${width}x${height}r|imageMogr2/scrop/${width}x${height}/`

return originImageUrl + '?' + rule  
```

那么，扩展能力对应的使用技巧如下：

|名称|使用方法|
|:----:|:----|
| 图像安全审核 | 使用扩展能力 | 
| 图像盲水印 | 使用扩展能力或拼接数据万象规则 | 
| 图像处理 | 使用扩展能力或拼接数据万象规则 | 
| 图像标签 | 使用扩展能力 | 


## 人脸识别

借助图像安全审核、图像处理来完成人脸识别的流程。图像安全审核在下文中会讲解，这里向讲解人脸智能裁剪和人脸识别。

完整的时序图如下：

![](https://n1image.hjfile.cn/res7/2020/05/02/94b880c0d1fbd35c5df792692ead3148.png)

### 人脸智能裁剪

将图像进行缩放及裁剪，有两种方法进行。一种是小程序侧借助小程序图片裁剪插件（如 `image-cropper`）让用户自己手动裁剪，而另一种就是借助数据万象中[裁剪](https://cloud.tencent.com/document/product/460/36541)来自动完成图片裁剪。

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

### 人脸识别
腾讯云的[人脸识别](https://cloud.tencent.com/document/api/867/32800)服务支持使用图片链接（`Url`）或者图片 Base64 数据（`Image`）来完成人脸识别。

这里，我通过 fileID 获取图片临时链接，以提供给人脸识别使用。

![](https://n1other.hjfile.cn/res7/2020/04/12/ae020750c69cc3c4938542ea98d64e48.PNG)


```js
// 人脸识别示例代码
const detectFace = (Image) => {

  let faceReq = new models.DetectFaceRequest()

  // 支持图片链接或图片base64数据
  let query_string = JSON.stringify(Image.includes('http') ? {
    Url: Image, // 这里是图片链接，以http开头
    MaxFaceNum: 5,
    NeedFaceAttributes: 1
  } : {
      Image, // 这里是图片Base64数据
      MaxFaceNum: 5,
      NeedFaceAttributes: 1
    })
  
  // 传入json参数
  faceReq.from_json_string(query_string);

  // 进行人脸识别
  return new Promise((resolve, reject) => {
    // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
    client.DetectFace(faceReq, function (error, response) {
      // 请求异常返回，打印异常信息
      if (error) {
        const { code = '' } = error
        console.log('code :', code);

        resolve({
          data: {},
          time: new Date(),
          status: -10086,
          message: 'DetectFace ' + status.DETECT_CODE[code] || code || '图片解析失败'
        })
        return
      }
      // 请求正常返回，打印response对象
      resolve({
        data: response,
        time: new Date(),
        status: 0,
        message: ''
      })
    })
  });
}
```

完整的使用示例，请参照 https://github.com/hi-our/hi-face/blob/1.x-stable/cloud/functions/detect-face/index.js


**注意点**

> 接口文档：最多返回面积最大的 5 张人脸属性信息，超过 5 张人脸（第 6 张及以后的人脸）的 FaceAttributesInfo 不具备参考意义。

* `MaxFaceNum`：最大识别人数建议限定为5个
* `NeedFaceAttributes`：设置为1时，才会返回人脸属性值（魅力值）

## 图像安全审核

> 图像安全审核提供鉴黄、鉴政、鉴暴恐等多种类型的敏感内容审核服务，有效识别违禁图片，规避违规风险。

我们这里对比了云开发扩展能力的 `图片安全审核` 与开放能力的 `图片安全审核` 的差异。


| 名称 | 额度 | 数据类型  |
| :---| :--: | :-------: |
| 图片安全审核<br />云开发扩展能力 | 2000张/日 |      云存储fileId中图片绝对地址       |
| imgSecCheck<br />开放能力 | 免费 |      Buffer       |

**图片安全审核，来自云开发扩展能力**

接口文档：https://docs.cloudbase.net/extension/abilities/image-examination.html

**使用步骤：**
1. 上传图片到云存储
2. 云函数调用`图片安全审核，来自云开发扩展能力`进行校验
3. 如果是违规图片，可能还需要从云存储上删除，以免占用不必要的空间

**开放能力 imgSecCheck**

接口文档 https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/sec-check/security.imgSecCheck.html

在实际使用中发现的大问题，图片 `Buffer` 大小超过 100k，可能就报图片太大的错误了。有的小伙伴说，10k都可能会报错。

### 使用方法
```js
// 图片安全审核，来自云开发扩展能力
async function demo() {
  try {
    const opts = {
      type: ["porn", "terrorist", "politics"]
    }
    const res = await tcb.invokeExtension('CloudInfinite',{
      action:'DetectType',
      cloudPath: "ab.png", // 需要分析的图像的绝对路径，与tcb.uploadFile中一致
      operations: opts
    })
    console.log(JSON.stringify(res.data, null, 4));
  } catch (err) {
    console.log(JSON.stringify(err, null, 4));
  }
}
```

完整的使用示例，请参照 https://github.com/hi-our/hi-face/blob/1.x-stable/cloud/functions/image-safe-check/index.js

## 多图裁剪

多图片裁剪，我目前用到的方案是直接通过拼接图片路径的方式。
1. 通过 `fileID` 获取图片临时链接 `imageUrl`
2. 在`imageUrl`后拼接参数

![](https://n1image.hjfile.cn/res7/2020/05/02/22fefc65fe8ae71a97a1cb65b5b9954d.png)

```js
if (imageUrl) {
  let prefex = imageUrl.includes('?') ? '|' : '?'
  const list = ruleList.map(item => {
    const { width, height, x, y } = item
    let 
    let rule = prefex + 'imageMogr2/cut/' + width + 'x' + height + 'x' + x + "x" + y

    return {
      fileImageUrl: imageUrl + rule
    }
  })
}
```

## 图片主色调
在`图像处理`中其实有一项十分好用的功能，那就是获取图片主色调，这个能力是基于云存储的数据万象来做的。

![](https://n1other.hjfile.cn/res7/2020/04/12/969c1959a0b48b23f202b70235dda365.JPG)

其实用方法为将云存储的图片链接后拼接`?imageAve`。而我这里还打算将颜色转换放在里面，因为可能需要的颜色是带透明度的RGBA颜色。

```js
exports.main = async (event) => {
  const { fileID = '', opacity = 1, colorType = 'default' } = event

  console.log('fileID :', fileID);

  if (fileID) {
    try {
      const imgUrl = await getImageUrl(fileID)

      // 云存储的图片临时链接拼接`?imageAve`
      const res = await fetch.get(imgUrl + '?imageAve')
      const { RGB } = getResCode(res)
  
      // 根据所需颜色的透明度（opacity）和类型（colorType）来返回对应的颜色值
      const colorHex = '#' + RGB.substring(2)
      const colorRgbaObj = hexToRgba(colorHex, opacity)
      const colorRgba = colorRgbaObj.rgba
      const colorRgb = `rgb(${colorRgbaObj.red}, ${colorRgbaObj.green}, ${colorRgbaObj.blue})`
  
      // 支持多种颜色获取方式
      let mainColor = opacity === 1 ? colorHex : colorRgba
      if (colorType === 'hex') {
        mainColor = colorHex
      } else if (colorType === 'rgb') {
        mainColor = colorRgb
      }

      return {
        data: {
          mainColor
        },
        time: new Date(),
        status: 0,
        message: ''
      }
      
    } catch (error) {
      return {
        data: {},
        time: new Date(),
        status: -10087,
        message: JSON.stringify(error)
      }
    }

  }

  return {
    data: {},
    time: new Date(),
    status: -10086,
    message: '请设置 fileID'
  }
}
```

完整的使用示例，请参照 https://github.com/hi-our/hi-face/blob/1.x-stable/cloud/functions/get-main-color/index.js

## 图像标签

> 图像标签对云存储中存量数据的图片标签识别，返回图片中置信度较高的主题标签，帮助开发者分析图像。

![](https://n1image.hjfile.cn/res7/2020/04/12/9cd41ecbf9d287661512af1060bf2039.jpg)

> 上图中，人体、婚纱等文字就是图像标签。

```js
let imgID = fileID.replace('cloud://', '')
let index = let .indexOf('/')
let cloudPath = imgID.substr(index)

const res = await tcb.invokeExtension("CloudInfinite", {
  action: "DetectLabel",
  cloudPath: cloudPath // 需要分析的图像的绝对路径，与tcb.uploadFile中一致
})

const { Labels } = getResCode(res)
// 兼容只有标签时为对象的情况
const tmpLabels = Labels.length > 1 ? Labels : [Labels]

const list = tmpLabels.map(item => ({
  confidence: item.Confidence,
  name: item.Name
}))
```

完整的使用示例，请参照 https://github.com/hi-our/hi-face/blob/1.x-stable/cloud/functions/detect-image-label/index.js


## 文章相关内容：

### 作者简介

我是 **盛瀚钦**，沪江 CCtalk 前端开发工程师，腾讯云云开发布道师，Taro 社区共建者，开发了 Hi 头像小程序，并著有技术小册《从0到1开发一个智能头像识别小程序》。

个人网站为：https://www.xiaoxili.com

