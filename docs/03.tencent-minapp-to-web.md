# 文章标题：简单几步，让微信小程序变身 H5 网页

云开发（Tencent Cloud Base，TCB）是腾讯云为移动开发者提供的一站式后端云服务，它帮助开发者统一构建和管理资源，免去了移动应用开发过程中繁琐的服务器搭建及运维、域名注册及备案、数据接口实现等繁琐流程，让开发者可以专注于业务逻辑的实现，而无需理解后端逻辑及服务器运维知识，开发门槛更低，效率更高。

官方教程：https://tencentcloudbase.github.io/

## Web 端调用云开发

### 开通步骤

1. 先开通小程序的云开发环境，若已开通，此步骤可忽略。
2. 访问[腾讯云云开发](https://console.cloud.tencent.com/tcb)，以“微信公众号”进行登录，授权所需小程序即可登录。（每个小程序对应着独立的腾讯云账号，当然也可以在腾讯云的账号上绑定唯一的一个小程序。）
3. 在“用户管理=>登录设置”开通“匿名登录”。（我的目标是跑通Web端，所以此处并未对完整登录校验做深入讨论。）

> 如果有疑问，可以在腾讯云上提工单，工单的回复速度比较快。



### 配置方法

**方案一：Script引入**

适合普通网页使用

```html
<script src="//imgcache.qq.com/qcloud/tcbjs/1.3.8/tcb.js"></script>
<script>
  var app = tcb.init({
    env: 'development-v9y2f'
  })
</script>
```

**以npm 引入**

云开发可以通过 tcb-js-sdk 来访问：

```js
npm install --save tcb-js-sdk@latest
```

要在你的模块式使用模块可以
```js
const tcb = require('tcb-js-sdk');
```

或
```js
import * as tcb from 'tcb-js-sdk';
```

```js
// 初始化环境
const app = tcb.init({
  env: '你的环境 Id'
});
```

> `tcb-js-sdk` 支持多端适配，如微信小程序、Web端、QQ小游戏等，具体可以看 [https://github.com/TencentCloudBase/tcb-js-sdk/blob/master/docs/adapters.md](https://github.com/TencentCloudBase/tcb-js-sdk/blob/master/docs/adapters.md)


而我的代码是基于 Taro 跨端框架。

```js
import * as tcb from 'tcb-js-sdk';

componentWillMount() {

  // 
  if (process.env.TARO_ENV === 'weapp') {
    Taro.cloud.init({
      env: '环境 ID'
    })
  } else if (process.env.TARO_ENV === 'h5') {
    // 将TCB绑定到 Taro.coud 上便于全局使用
    // 实测 tcb-js-sdk 大部分的 API 与wx.cloud好像一样
    Taro.cloud = tcb.init({
      env: '环境 ID'
    })

    // 匿名登录
    Taro.cloud.auth().signInAnonymously().then(() => {

      // 这里代码可以不写，我是想调用云开发的云函数，来验证是否成功调用。
      Taro.cloud.callFunction({
        name: 'thanks-data',
        data: {}
      }).then(res => console.log('thanks-data res', res))

    }).catch(error => {
      console.log('error :', error);
    })
  }
}

```
这里补充一些关于 Taro 的信息

Taro 是一套遵循 React 语法规范的 多端开发 解决方案。  

使用 Taro，我们可以只书写一套代码，再通过 Taro 的编译工具，将源代码分别编译出可以在不同端（微信/百度/支付宝/字节跳动/QQ/京东小程序、快应用、H5、React-Native 等）运行的代码。


## 项目开发中所踩的坑

### 适配过程

从微信小程序迁移到Web端，不是一蹴而就的。在我的“快快戴口罩”小程序中，我是基于以下三个页面来完成的：

* 致谢页（pages/thanks/thanks）：调用云函数，让页面正常运转
* 圣诞帽canvas画图（pages/test/test）：调用云函数，自动在`canvas`画上人物图片和圣诞帽，完成小程序端与Web端的适配。
* 口罩页（pages/wear-a-mask/wear-a-mask）：完整流程，包含云开发、UI适配、图片识别及图片生成等。

### 画布功能

**小程序侧** 所要绘制的图片资源（网络图片要通过 getImageInfo / downloadFile 先下载），也就是说，小程序上所需的是有效的本地图片地址，比如本地路径、代码包路径。

**Web端** 需要的是Img元素在onload后，也就是需要将图片加载完后再进行绘制。

```js
// Web 端，获取图片元素
const getH5Image = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = src
    image.id = `temp_image_${Date.now()}`;
    image.style.display = 'none';
    document.body.append(image);
    image.onload = () => resolve(image)
    image.onerror = () => reject(image)
  })
}

// 获取网络图片
export const getImg = async (src) => {

  try {
    if (process.env.TARO_ENV === 'h5') {
      let image = await getH5Image(src)
      return image
    }

    if (src.includes(';base64,')) {
      return await base64src(src)
    }

    const res = await Taro.getImageInfo({
      src
    })
    return res.path
    
  } catch (error) {
    console.log('error :', error);
    throw error
    
  }
}
```
### 样式适配

Taro H5版本上少了一些样式适配。

``` html
<!-- index.html 加入iPhone X适配-->
<meta content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover" name="viewport">
```

```css
html #app .taro_page {
  height: 100%;
}
html button {
  display: inline-block;
  width: auto;
  border: none;
}
html .taro-text {
  white-space: pre-line;
}
/* iPhone x异形屏适配 */
html .taro-tabbar__tabbar-bottom {
  margin-bottom: calc(env(safe-area-inset-bottom) / 3);
}
```

### 功能隐藏
> 小程序特有，Web端缺失

**分享给朋友 `Button`**

```html
<Button className='share-btn' openType='share'>分享给朋友<View className='share-btn-icon'></View></Button>
```

**图片压缩 `wx.compressImage`**


### 文章相关内容：

> 珍爱生命，从我做起，快点戴上口罩，给大家介绍我开源的 Taro + 腾讯云开发 小程序「快快戴口罩」它可以智能识别人脸，给集体照戴上口罩。(*￣︶￣)

采用 `Taro` 跨端框架，采用腾讯云开发模式，采用基于腾讯云的五官分析的人脸识别，实现了自动为头像戴上口罩的功能。

源码地址：

[https://github.com/shenghanqin/quickly-mask](https://github.com/shenghanqin/quickly-mask "https://github.com/shenghanqin/quickly-mask")

我是 **盛瀚钦**，沪江 CCtalk 前端开发工程师，Taro 框架的 issue 维护志愿者，主要侧重于前端 UI 编写和团队文档建设。

**主要功能**

- 智能识别人脸，进行五官定位
- 支持多人识别，并戴上口罩
- 以后会增加多种节日的效果

**扫码预览**

微信搜一搜：快快戴口罩

![](https://n1image.hjfile.cn/res7/2020/02/02/e40fff62cb635dd9be797226f7c266ed.png)

## 小程序截图
![](https://n1other.hjfile.cn/res7/2020/02/10/1b0add271a294e2bf1140d124eaf595b.JPG)


