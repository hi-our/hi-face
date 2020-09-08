---
title: Web 云开发实战之盲水印添加工具（步骤版）
---

图像盲水印将水印信息以不可见的形式添加到原图信息中，您可对疑似被盗取的资源进行盲水印提取，验证图片归属。

>!如果您在 web 网站使用该扩展，请先在 [云开发控制台](https://console.cloud.tencent.com/tcb/user) 将网站域名添加为当前环境的安全域名。其他要求如下：

* 使用盲水印功能，水印图的宽高不得超过原图的1/8，超过就会报 `Invalid Frame Size`的错误。
* 为保证盲水印效果，水印图请选用黑底白色图片。
* 数据万象为每个账户提供每月3000张的免费体验额度，超出后将正常计费。未使用额度不会累积至下一月。
* 文字盲水印当前支持数字[0 - 9]及英文大小写[A - Z,a - z]。
* 盲水印可抵抗裁剪、涂抹、变色等多种图片盗取攻击，防盗效果与原图大小及攻击程度相关。


## 适用场景
### 鉴权追责-半盲水印
您可对图片资源增加半盲水印，在发现恶意攻击方盗取您的资源后将疑似被盗取图取回，并与相应原图进行盲水印提取操作，若能够得到有效水印图即可证明资源归属。

### 上传查重-全盲水印
为解决部分用户使用其他用户资源重复上传相同信息的问题（如房产图、汽车图、商品图等），您可在用户上传图片资源前先进行全盲水印提取，若提取到水印图信息则证明该图片来自之前已有资源，并进行相应操作（如提醒用户请勿重复上传资源）；若不存在全盲水印则添加全盲水印，保护图片资源不被其他用户下载后重复上传。

### 资源防泄露-文字盲水印
对于内部分享的图片资源，您可通过文字盲水印将访问方的信息在请求图片时添加至图片中，当资源泄露后可通过流传出的资源图提取出盲水印，进而得到泄露方信息。

## 创建云开发环境
> 3min

### 一、新建【按量计费云开发环境】

> 我这里使用的是小程序云开发环境，将其开通了按量付费模式。

进入[腾讯云云开发控制台-创建环境](https://console.cloud.tencent.com/tcb/env/index?action=CreateEnv)，选择按量计费环境，环境名称可以自定义设置。如果已有按量计费环境则可以跳到下一步。
![](https://n1image.hjfile.cn/res7/2020/05/23/f6f26d801dc69d2c6f7674ee5f82a973.png)

### 二、开通静态网站托管服务
进入[进入静态网站控制页](https://console.cloud.tencent.com/tcb/hosting/index),选择刚才创建好的环境，开通静态网站托管服务。
![](https://n1image.hjfile.cn/res7/2020/05/23/97d013d5a16615fb4def91b5fd7178a7.png)

### 三、开启匿名登录
进入[环境设置页-登录授权](https://console.cloud.tencent.com/tcb/env/login)的登录方式中，勾选匿名登录
![](https://n1image.hjfile.cn/res7/2020/05/23/7a6719e371e5d061022b1f429f0fe7c9.png)

### 四、将云存储权限暂时放开

因为只是用了匿名登录，而尚未使用自定义登录或其他Web端登录方式，此处需要将云存储的权限放开一些。

位置：云存储 => 权限控制

```JSON
{
  "read": true,
  "write": true
}
```

---
## 下载并部署源码
> 10min

### 一、下载源码
访问[Hi头像 Github仓库](https://github.com/hi-our/hi-face),下载源码到本地。源码项目目录如下：
* project.config.json 小程序项目目录，若Web云开发，可以换一种方式引入
* taro/ 项目基于 Taro 构建
  * src/
    * app.js 全局配置文件，项目入口
    * pages/
      * image-watermark 盲水印添加工具
* cloud/functions/
  * image-watermark 盲水印的添加与识别功能


> 项目简要说明
> 本项目名为Hi头像，为小程序与 Web 端可以同时运行的项目，依托于Taro 多端架构。如果你想用纯粹的 React 来运行项目，可以将项目配置与页面组件进行简要修改。





### 二、本地运行
将项目webviews/index.html以http的形式运行，可使用IDE工具vscode，hbuilder。在浏览器的地址栏中确定url地址，比如例子中，域名地址为127.0.0.1:10086
![](https://n1image.hjfile.cn/res7/2020/05/23/cf72d4bf7086e817ef8b36d3e650ecaa.png)

```shell
# 打开 Taro 文件夹
cd taro

# 安装项目依赖
npm i

# 按照下面的步骤修改云函数与前台（Web或小程序）的环境id

# 启动Taro Web端
npm run local
```

### 四、配置本地开发的安全域名
如果想在本地开发，必须要在云开发中配置本地的安全域名才能够正常调试开发。
进入[环境设置页-安全配置](https://console.cloud.tencent.com/tcb/env/safety),配置WEB安全域名，在这里以 `127.0.0.1:10086`举例，请按照自己的实际域名配置。

![](https://n1image.hjfile.cn/res7/2020/05/23/e44e7744ff53a62ecd3471efc98941e6.png)

### 五、填写云开发环境ID到项目中

#### Web 云开发运行方案
因为我的项目所用的云环境是从小程序云开发中生成的，而为了让使用Web云开发的同学能运行起 Web 云开发，我这里放上 [TCloudBase/WEB-2048](https://github.com/TCloudBase/WEB-2048) 的环境 id 配置方案

云开发是通过环境ID来判定与特定环境进行数据通信的，所以在项目中要配置所有的相关环境ID为自己的ID。（建议熟练后，使用配置文件形式来配置）

- 进入[环境总览页](https://console.cloud.tencent.com/tcb/env/overview),复制获取云开发环境ID。
  ![](https://n1image.hjfile.cn/res7/2020/05/23/c2f9b0d7c5a7d7b7ce763eb7b48bfc4e.png)
- 打开项目目录，将以下文件中标注有【云开发环境ID】处替换成自己的云开发环境ID
    - cloudfunctions/app/index.js 第4行
        ![](https://n1image.hjfile.cn/res7/2020/05/23/4a691aa821bc715eb8a9e7bace549fc3.png)

    - cloudbaserc.js 第2行
        ![](https://n1image.hjfile.cn/res7/2020/05/23/c4a30d7fd1daf1925da9570e27ccffb2.png)

    - webviews/asset下的cloud.js文件，第2行
        ![](https://n1image.hjfile.cn/res7/2020/05/23/25969bfd8d29855fe89c491ffb2b9a28.png)

#### 小程序云开发运行方案

```js
// cloud/functions/image-watermark
tcb.init({
  env: 'env-id'
})
```

```js
// Web 云开发SDK
import tcb from 'tcb-js-sdk'

componentWillMount() {
  // 小程序侧环境配置
  if (process.env.TARO_ENV === 'weapp') {
    Taro.cloud.init({
      env: 'env-id',
      traceUser: true
    })

  } else if (process.env.TARO_ENV === 'h5') {

    Taro.cloud = tcb.init({
      env: 'env-id',
      traceUser: true
    })
    // console.log('登录云开发成功！')
    Taro.cloud.auth().signInAnonymously().then(() => {
      console.log('匿名登录成功 :')
    }).catch(error => {
      console.log('error :', error);
    })
  }
}
```

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

### 云函数核心代码

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

    console.log('imageWatetMark rule : ', rule);

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
### 前台（Web 或 小程序）核心代码
```js
onGenerateImage = async () => {
  const { originFileID, waterType, waterText, waterFileID } = this.state

  // 前端校验
  if (waterType === 3 && !waterText) {
    this.onShowToast('请输入水印文字')
    return
  } else if (waterType !== 3 && !waterFileID) {
    this.onShowToast('请选择水印图片')
    return
  }

  try {
    Taro.showLoading({
      title: '图片生成中'
    })

    // 设置云函数参数
    let tempState = {
      fileID: originFileID,
      waterType,
    }

    if (waterType === 3) {
      tempState.waterText = waterText
    } else {
      tempState.waterFileID = waterFileID
    }

    // 图片添加水印
    const { fileID, fileUrl } = await cloudCallFunction({
      name: 'image-watermark',
      data: tempState
    })

    Taro.hideLoading()

    console.log('fileID :>> ', fileID);
    this.setState({
      isWaterChanged: false,
      savedFileID: fileID,
      savedUrl: fileUrl
    })

  } catch (error) {
    Taro.hideLoading()
    console.log('error :>> ', error);
    const { message } = error || {}
    this.onShowToast(message || JSON.stringify(error))
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


### 云函数核心代码

* `fileID` 添加水印后的图片 FileID
* `waterType` 水印类型，1为半盲水印，2为全盲水印，3为文字型水印
* `waterText`，水印文字，在文字型水印中用到
* `originFileID` 半盲水印中所用到的原图
* `savedFileID` 全盲水印中添加了水印的图片


```js
async function imageWatetMarkParse(event) {
  const { fileID, waterType = 3, waterText = '', originFileID  = '', savedFileID = '' } = event
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
      rule.image = getImagePath(originFileID).cloudPath
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

### 前台（Web 或小程序）核心代码
```js
onLookCheck = async () => {
  const { savedFileID, waterType, waterText, originFileID, isWaterChanged } = this.state

  if (isWaterChanged) {
    this.onShowToast('请重新生成水印图片')
    return 
  }

  try {
    Taro.showLoading({
      title: '图片生成中'
    })

    let tempState = {
      fileID: savedFileID,
      waterType,
    }

    if (waterType === 3) {
      // 文字水印
      tempState.waterText = waterText
    } else if (waterType == 1) {
      // 全盲水印
      tempState.originFileID = originFileID
    }else if (waterType == 2) {
      // 全盲水印
      tempState.savedFileID = savedFileID
    }

    const { fileID, fileUrl } = await cloudCallFunction({
      name: 'image-watermark',
      data: {
        type: 'parse',
        ...tempState
      }
    })

    Taro.hideLoading()

    console.log('onLookCheck fileID :>> ', fileID);
    this.setState({
      isWaterChanged: false,
      waterSeeFileID: fileID,
      waterSeeUrl: fileUrl
    }, () => {
      this.posterRef.onShowPoster()
    })

  } catch (error) {
    Taro.hideLoading()
    console.log('error :>> ', error);
    const { message } = error || {}
    this.onShowToast(message || JSON.stringify(error))
  }
  
}
```

## 更多实战代码技巧

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

