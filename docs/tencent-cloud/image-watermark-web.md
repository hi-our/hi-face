---
title: Web 云开发实战之盲水印添加工具（核心版）
---


图像盲水印将水印信息以不可见的形式添加到原图信息中，您可对疑似被盗取的资源进行盲水印提取，验证图片归属。

为您提供半盲、全盲和文字盲水印三种类型，您可根据需要进行选择：

设置盲水印的技巧

>!如果您在 web 网站使用该扩展，请先在 [云开发控制台](https://console.cloud.tencent.com/tcb/user) 将网站域名添加为当前环境的安全域名。其他要求如下：
* 开通后，每个账户拥有三千次免费额度，超出后进行计费。
* 使用盲水印功能，水印图的宽高不得超过原图的1/8，超过就会报 `Invalid Frame Size`的错误。
* 为保证盲水印效果，水印图请选用黑底白色图片。
* 数据万象为每个账户提供每月3000张的免费体验额度，超出后将正常计费。未使用额度不会累积至下一月。
* 文字盲水印当前支持数字[0 - 9]及英文大小写[A - Z,a - z]。
* 盲水印可抵抗裁剪、涂抹、变色等多种图片盗取攻击，防盗效果与原图大小及攻击程度相关


## 适用场景
### 鉴权追责-半盲水印
您可对图片资源增加半盲水印，在发现恶意攻击方盗取您的资源后将疑似被盗取图取回，并与相应原图进行盲水印提取操作，若能够得到有效水印图即可证明资源归属。

### 上传查重-全盲水印
为解决部分用户使用其他用户资源重复上传相同信息的问题（如房产图、汽车图、商品图等），您可在用户上传图片资源前先进行全盲水印提取，若提取到水印图信息则证明该图片来自之前已有资源，并进行相应操作（如提醒用户请勿重复上传资源）；若不存在全盲水印则添加全盲水印，保护图片资源不被其他用户下载后重复上传。

### 资源防泄露-文字盲水印
对于内部分享的图片资源，您可通过文字盲水印将访问方的信息在请求图片时添加至图片中，当资源泄露后可通过流传出的资源图提取出盲水印，进而得到泄露方信息。


## 水印添加
不仅在云函数中可以使用该扩展能力，也可以在客户端使用，文件读写权限策略与云存储一致，减去您额外的权限管理工作。

### 文字型

文字盲水印的噪声相对比较大。这个图片因为本身背景平滑，所以加了水印之后的噪声比较突出。文字盲水印，比较适合非纯色背景的图像。

**原图**  
![](http://6465-development-v9y2f-1251170943.tcb.qcloud.la/avatar-1589379094339-8419895.jpg)

**加了水印的图片**  
![](http://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/avatar-1589379094339-8419895.jpg)

### 半盲型

* 宽高不能超过 640x640，在使用时最好提醒一下
* 水印图片的宽高不要超过原图的 1/8，并且是黑底白字。
* 我这里用的是宽度为40的图片，因为半盲水印最大宽为640，那这个水印宽度为40会比较合适

水印图  
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/temp/1590069884551-523871.jpg)

![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/temp/1590068634905-8081306.jpg)

### 全盲型

* 水印图片的宽高不要超过原图的 1/8，并且是黑底白字
* 我这里用的是宽度为100的图片，原图高为1200

**水印图** 
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/temp/1590069884551-523871.jpg)

**加了水印的图片**
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/temp/1590068469848-3431045.jpg)

### 添加水印的核心代码

* `fileID` 原图FileID
* `waterType` 水印类型，1为半盲水印，2为全盲水印，3为文字型水印
* `waterText`，水印文字
* `waterFileID` 水印图片，宽高必须小于原图宽高的小边的 1/8


```js
async function imageWatetMark(event) {
  const { fileID, waterType = 3, waterText = '', waterFileID = ''} = event

  if (!fileID) {
    console.log('请设置fileID :')
    return
  }

  try {
    const { cloudPath, cloudEnvPath } = getImagePath(fileID)

    let rule = {
      mode: 3,
      type: waterType,
    }

    if (waterType === 3) {
      rule.text = waterText // 支持数字[0 - 9]及英文大小写[A - Z,a - z]
    } else {
      rule.image = getImagePath(waterFileID).cloudPath
    }
    const opts = {
      rules:
        [
          {
            // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
            fileid: '/watermark' + cloudPath,
            rule
          }
        ]
    }

    console.log('imageWatetMark rule :>> ', rule);

    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'WaterMark',
      cloudPath: cloudPath, //需要分析的图像的绝对路径
      operations: opts
    })

    let data = getResCode(res)
    let result = getResultInfo(data, cloudEnvPath)
    return {
      data: result,
      status: 0,
      message: '',
      time: new Date()
    }
  } catch (error) {
    console.log('error :', error)
    return {
      data: '',
      status: -30002,
      message: JSON.stringify(error),
      time: new Date()
    }
  }
}
```

## 水印提取

### 文字型

文字型盲水印，我实践下来识别结果还OK，可能存在识别几个字母的一两个，依据图片和水印情况而定。

![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/temp/1590068784258-9107357.jpg)

识别出的水印  
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/parse/watermark/temp/1590068784258-9107357.jpg)


### 半盲型

* 生成后的图片
* 规则图片为未带盲水印的原图图片地址

**加了水印的图片**  
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/temp/1590068634905-8081306.jpg)

**识别出的水印**  
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/parse/watermark/temp/1590068634905-8081306.jpg)

### 全盲型

* 生成后的图片
* 规则图片为已经添加盲水印的图地址

**加了水印的图片**  
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/temp/1590068469848-3431045.jpg)

**识别出的水印**  
![](https://6465-development-v9y2f-1251170943.tcb.qcloud.la/watermark/parse/watermark/temp/1590068469848-3431045.jpg)


### 提取水印的核心代码

* `fileID` 原图FileID
* `waterType` 水印类型，1为半盲水印，2为全盲水印，3为文字型水印
* `waterText`，水印文字，在文字型水印中用到
* `waterFileID` 水印图片，宽高必须小于原图宽高的小边的 1/8，在半盲型水印中用到
* `savedFileID` 添加了水印的图片，在全盲型水印中用到


```js
async function imageWatetMarkParse(event) {
  const { fileID, waterType = 3, waterText = '', savedFileID = '' } = event
  if (!fileID) {
    console.log('请设置fileID :')
    return
  }

  try {
    const { cloudPath, cloudEnvPath } = getImagePath(fileID)

    let rule = {
      mode: 4,
      type: waterType,
    }

    if (waterType === 3) {
      rule.text = waterText // 支持数字[0 - 9]及英文大小写[A - Z,a - z]
    } else if (waterType === 1) {
      rule.image = getImagePath(fileID).cloudPath
    } else if (waterType === 2) {
      rule.image = getImagePath(savedFileID).cloudPath
    }

    const opts = {
      rules:
        [
          {
            // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
            fileid: '/watermark/parse' + cloudPath,
            rule
          }
        ]
    }

    console.log('imageWatetMarkParse rule :>> ', rule);

    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'WaterMark',
      cloudPath: cloudPath, //需要分析的图像的绝对路径
      operations: opts
    })

    
    let data = getResCode(res)
    
    let result = getResultInfo(data, cloudEnvPath)

    console.log('fileID :>> ', result.fileID);
    
    return {
      data: result,
      status: 0,
      message: '',
      time: new Date()
    }
  } catch (error) {
    console.log('error :', error)
    return {
      data: '',
      status: -30003,
      message: JSON.stringify(error),
      time: new Date()
    }
  }
}
```


## 实战代码技巧

### 快速获取图片所在的环境前缀前缀和绝对位置

```js
const cloudPrefix = 'cloud://'
const getImagePath = (fileID) => {
  let imgID = fileID.replace(cloudPrefix, '')
  let index = imgID.indexOf('/')
  let cloudPath = imgID.substr(index)
  let cloudEnvPath = imgID.substr(0, index)

  return {
    cloudPath,
    cloudEnvPath
  }
}
```

### 统一处理接口请求中的外侧包装,

```JSON
{
  "statusCode": 200,
  "data": {
    "UploadResult": {}
  }
}
```

```js
const getResCode = (res) => {
  if (res.statusCode === 200) {
    let result = res.data
    console.log('result :', result);
    if (result.UploadResult) {
      const finalResult = result.UploadResult
      if (Object.keys(finalResult).length === 0) return finalResult || {} // 某些接口判断返回data字段是否是空对象的逻辑
      return finalResult
    } else {
      throw result
    }
  } else {
    throw res.data
  }
}
```

### 将水印添加和水印的结果进行统一处理

```js
const getResultInfo = (data, cloudEnvPath) => {
  const { ProcessResults } = data

  let { Key, Width, Height, Location } = ProcessResults.Object
  return {
    // fileID 水印添加时为添加了水印的图片，水印提取时为提取出的水印图
    fileID: cloudPrefix + cloudEnvPath + '/' + Key,
    // fileUrl 为 fileID 对应的Url地址。因为Web端图片 src 不支持 cloudID
    fileUrl: 'https://' + Location,
    width: Width,
    height: Height
  }
}
```

## Taro 接入技巧

### 选择图片
在小程序侧选择的图片是本地路径，用户上传是没问题的。但在 Web 端时，会在 `tempFilePaths` 上绑定的是 `blob` 地址。
在我所用的 `tcb-jd-sdk` 中所需的是 `input file` 对象（其实大部分Web端都是用的`input file`）。

```js
const { tempFilePaths, tempFiles } = await Taro.chooseImage({
  count: 1,
  sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
  sourceType: ['album', 'camera'],
})

let useFiles = isH5Page ? tempFiles[0].originalFileObj : tempFilePaths[0]
```

### 图片展示

在小程序侧Image 支持云cloudId（fileID），但在 web 端
小程序内支持cloudId，但web端还是需要换取url的


```js
const getImageUrl = async (fileID) => {
  const { fileList } = await Taro.cloud.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}
```


### 图片大小适配

```css
.image-selected,
.image-saved-selected {
  width: 300px;
  height: 300px;
}

  & > img {
    width: 100%
    height: 100%
    object-fit contain

  }
```

