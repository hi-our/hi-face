---
title: 2.2 人脸五官分析的环境配置
---

<!-- TODO 还可以采用微信平台市场上的，调用更简单 -->

> v2 版中使用微信平台市场上优图的方案，具体代码在 `taro/src/utils/image-analyze-face.js` 内。

本文知识点

* 腾讯云人脸五官分析的调用方法
* 腾讯云人工智能服务介绍

![](https://n1image.hjfile.cn/res7/2020/03/30/31bfe7a9d5019902cf28ae98bea5085c.png)

腾讯云上除了有基本的域名、云服务器、云数据库以外，还有非常多的人工智能服务，这些服务都是有免费额度的，比如我所使用的人脸识别每个月就有10000次调用额度，还支持按量付费。关键是，这些功能都可以用 `tencentcloud-sdk-nodejs` 来直接调用。

在 [tencentcloud-sdk-nodejs
](https://github.com/TencentCloud/tencentcloud-sdk-nodejs) 中给出了详细的使用方法，而我这里把我的配置思路来讲解一下，把其中的一些细节优化点给写出来。

## 人脸五官分析的配置及调用

环境配置步骤大致为

* 申请安全凭证，即 `SecretID` 和 `SecretKey`，[链接](https://console.cloud.tencent.com/cam/capi)
* 将安全凭证放在`config.js`文件中
* 在主要功能里面调用安全凭证，并按照 `tencentcloud-sdk-nodejs
` 给出的示例代码来编写功能

![](https://n1image.hjfile.cn/res7/2020/03/30/17dd43c2d088bd79fafd159191f8266e.png)


### 配置安全密钥

> 将关键性配置抽离出来，在 `.gitignore` 将该文件忽略


```js
// cloud/functions/analyze-face/config.js
module.exports = {
  SecretId: '',
  SecretKey: ''
}
```

### 封装云函数：人脸五官分析

将人脸五官分析的主要源码给简单分析一下
> 对请求图片进行五官定位（也称人脸关键点定位），计算构成人脸轮廓的 90 个点，包括眉毛（左右各 8 点）、眼睛（左右各 8 点）、鼻子（13 点）、嘴巴（22 点）、脸型轮廓（21 点）、眼珠[或瞳孔]（2点）。

```js
// cloud/functions/analyze-face/index.js

const tencentcloud = require('tencentcloud-sdk-nodejs')
const config = require('./config')
const status = require('./status')

// 腾讯云的 SecretId 和 SecretKey
let secretId = config.SecretId || ''
let secretKey = config.SecretKey || ''


const IaIClient = tencentcloud.iai.v20180301.Client;
const models = tencentcloud.iai.v20180301.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

let httpProfile = new HttpProfile();
// 设置endpoint，对应的是具体产品所在的接口位置
httpProfile.endpoint = "iai.tencentcloudapi.com";
let clientProfile = new ClientProfile();

/*
推荐使用 V3 鉴权。当内容超过 1M 时，必须使用 V3 签名鉴权。https://cloud.tencent.com/document/product/1093/39964
*/
clientProfile.signMethod = "TC3-HMAC-SHA256";
clientProfile.httpProfile = httpProfile;

// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey
let cred = new Credential(secretId, secretKey);

// 实例化要请求产品(以cvm为例)的client对象
let client = new IaIClient(cred, "ap-shanghai", clientProfile);


const analyzeFace = (Image) => {
  let faceReq = new models.DetectFaceRequest()

  let query_string = JSON.stringify({
    Image
  })
  // 传入json参数
  faceReq.from_json_string(query_string);

  return new Promise((resolve, reject) => {
    // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
    client.AnalyzeFace(faceReq, function (error, response) {
      // 请求异常返回，打印异常信息
      if (error) {
        const { code = '' } = error
        console.log('code :', code);

        resolve({
          data: {},
          time: new Date(),
          status: -10086,
          // 在 status 中将错误码中做一个中英文对应，以方便调用者查看
          message: 'AnalyzeFace '+ status.FACE_CODE[code] + Image || code || '图片解析失败'
        })
        return
      }
      console.log('AnalyzeFace response :', response)
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

module.exports = {
  analyzeFace
}
```

### 在云函数主入口调用

云函数主入口，调用`analyzeFace`功能

```js
// cloud/functions/analyze-face/index.js
const reqFace = require('./req-iai-face').analyzeFace


exports.main = async (event) => {
  const { fileID = '', base64Main = '' } = event

  return analyzeFace(base64Main)
}

```

> 其实，在小程序审核时，图片上传或分析时，都是要求鉴别黄暴类的，所以，我这里还尝试使用了微信小程序开放能力的的`imgSecCheck`来完整这个目标，但发现所支持的图片体积大约为100Kb（官方标注500Kb），后来又换用了腾讯云所提供的类似功能。

## 腾讯云人工智能的特色功能

### 五官识别

体验网址：https://ai.qq.com/product/face.shtml#shape

![](https://n1image.hjfile.cn/res7/2020/03/30/471e65f3ce53f97cd62ca6dea599a626.png)

其实，启发我做这个小程序的是这两个文章，《[「圣诞特辑」纯前端实现人脸识别自动佩戴圣诞帽](https://juejin.im/post/5e02b73fe51d455807699b1f "「圣诞特辑」纯前端实现人脸识别自动佩戴圣诞帽")》和《[我要戴口罩 – 为微信、微博等社交网络头像戴口罩](https://www.appinn.com/woyaodaikouzhao-wechat-miniapp/ "我要戴口罩 – 为微信、微博等社交网络头像戴口罩")》。

因为新冠病毒疫情蔓延，而戴口罩就是一个必备的预防措施啦。那怎样才能创新呢，我在使用“我要戴口罩”小程序过程中发现，口罩的位置是手动移动的，我就想如何自动戴过去呢，正好先前看到的“自动识别戴圣诞帽”，那我来一个戴口罩就好了。

在“自动佩戴圣诞帽”中，使用的方案是纯前端的 face-api，想放到小程序中就会有如下几个小问题：

- face-api 的识别模型有 5M 大小还多，即使纯前端加载，也显得比较大。而小程序的 canvas 与 web 网页中的还是有差异的，没法直接用 face-api。
- face-api 放在 nodejs 上加载，还需要配合`tensorflow`和`canvas`模拟。实际实现后发现，图片识别过程还是比较慢的（图片上传后、获取图片内容、识别五官位置、返回五官数据），容易让接口请求发生超时的情况。

在使用腾讯云的过程中，我就发现，腾讯云的人工智能大类目下居然有人脸识别功能，细致推究发现里面有“[五官分析](https://cloud.tencent.com/document/api/867/32779 "五官分析")”，其返回的数据跟`face-api`返回的数据格式还是非常像的，“人脸识别”的每月免费额度 10000 次，当时就让我开心了一大把。

当然，使用过程中非常大的坑就是，我的实现过程是需要上传 1M 以上大小的图片，而“五官分析”签名方法需要`TC3-HMAC-SHA256`，官方提供 npm 版本`tencentcloud-sdk-nodejs`是不支持这个签名方法的，需要从[官方 GitHub](https://github.com/TencentCloud/tencentcloud-sdk-nodejs/tree/signature3 "官方 GitHub")库的`signature3`分支上下载对应的代码。


### 人脸识别

体验网址：https://ai.qq.com/product/face.shtml#detect

![](https://n1image.hjfile.cn/res7/2020/03/30/eb73939375831ee4100d9d7e0c314dc6.png)
> 检测给定图片中的人脸（Face）的位置、相应的面部属性和人脸质量信息，位置包括 (x，y，w，h)，面部属性包括性别（gender）、年龄（age）、表情（expression）、魅力（beauty）、眼镜（glass）、发型（hair）、口罩（mask）和姿态 (pitch，roll，yaw)，人脸质量信息包括整体质量分（score）、模糊分（sharpness）、光照分（brightness）和五官遮挡分（completeness）。

简单来说就是识别出人脸主要位置，以及给出相应的测评分数。



### 更多特色功能及对应链接

* `人像变换`，包含年龄、性别 https://cloud.tencent.com/product/ft
* `人脸美妆`，比`智能美颜`更容易一些 https://ai.qq.com/product/facemakeup.shtml
* `滤镜`效果很不错 https://ai.qq.com/product/imgfilter.shtml
* `大头贴` https://ai.qq.com/product/sticker.shtml
* QQ AI的SDK
  * https://www.npmjs.com/package/tencent-ai-nodejs-sdk
  * https://github.com/w89612b/qqai-api-sdk



