---
title: 2.1 小程序开启云开发模式
---

本文知识点：

* 小程序切换成云开发模式的简要步骤
* `hi-face` 项目的主要文件结构

## 小程序项目配置 project.config.json

### 普通模式

* `miniprogramRoot` 是小程序代码目录，此处写的是Taro编译后的dist目录
* `appid` 微信小程序的appid


```json
{
  "miniprogramRoot": "taro/dist/",
  "appid": "testappid"
}
```

### 开通云开发模式

**开通云环境**

* 在微信开发者工具控制台上，点击“云开发”按钮，就可以新建云开发环境。最多支持两个
* 建好之后，就可以看到你的云环境的名称，如下图

![](https://n1image.hjfile.cn/res7/2020/03/29/97f0a08f4779c07add38f10fb7c4f526.png)

**云环境配置说明**

* `cloudfunctionRoot` 云开发的云函数所在的目录
* `cloudfunctionTemplateRoot` 云开发的云函数测试数据模板所在的目录
<!-- * `qqappid` QQ小程序的appid。即腾讯云云开发目标支持跨端使用 -->

```json
{
  "miniprogramRoot": "taro/dist/",
  "cloudfunctionRoot": "cloud/functions/",
  "cloudfunctionTemplateRoot": "cloud/template/",
  "appid": "testappid"
}
```

> `hi-face` 是基于 Taro 的，可以使用其 `taro-cli` 中的云开发模板来初始化一个新的小程序项目，观察里面的文件目录设置来以作为参考。

### 云开发模式配置及使用

1. 小程序启动时，初始化云环境
2. 在需要调用云函数或云存储的地方，调用对应的 `callFunction` 等方法即可

```js
// taro/src/pages/app.js
Taro.cloud.init({
  env: 'name-id' // 云开发环境名
})

// taro/src/pages/avatar-edit/avatar-edit.js
Taro.cloud.callFunction({
  name: 'analyze-face',
  data: {
    fileID: '12345'
  }
}).then(res => console.log(res))
```


## `hi-face` 项目的主要文件结构

```
|- cloud
  |- functions 云函数目录
  |- template 小程序云函数的调试模板
|- taro Taro 主目录
  |- config/ Taro 项目配置 
  |- src 功能主代码
  |  |- app.js 项目主入口
  |  |- config.js 运行时的全局配置
  |  |- components 通用组件
  |  |  |- taro-cropper 图片裁剪插件
  |  |- pages 页面
  |  |  |- avatar-edit 头像编辑页
  |  |  |- avatar-poster 头像分享页 / 头像作品页
  |  |  |- theme-list 主题列表页
  |  |  |- self 我的，包含头像列表
  |  |- utils 通用方法
  |  |  |- common.js 常用的方法，比如判断iPhoneX
  |  |  |- fetch/index.js 接口情况的封装，对云函数调用的 cloudCallFunction 也在其中
  |  |  |- image-utils.js 获取图片、图片转 base64、上传图片等
  |  |  |- face-utils.js 人脸识别的处理方法，包含人脸的头顶中间位置、嘴部最近位置等
```

### 头像编辑页主流程

头像编辑页的主流程：
> v2 版
![](https://image-hosting.xiaoxili.com/img/img/20200909/1d891b86e78cda7a58496ac48fc94f4f-e9ac05.jpg)


## 常见问题

**接口请求体太大，还未接收到请求结果，云函数就返回失败？**

将接口请求的返回数据调大一些，如20秒

```json
"networkTimeout": {
  "request": 20000,
  "downloadFile": 10000
}
```

**云函数容易超时吗？**

云函数默认的超时时间为 3 秒，这对于普通的网络请求还算够用。

云函数存在冷启动的情况，并且调用五官分析等也需要 0.5s 到 3s 的时间，需要将云函数的超时时间改为10s ~ 20s。

**微信开发者工具上使用云函数本地调试的时候，函数还未发出就报错，并且返回的 `result` 为 `null`**

我在做“人脸五官分析”功能的时候，曾经调用了约 1Mb 大小的 base64 图片数据，就遇到了这个问题。后来努力将 base64 图片数据降为 150Kb（在图片识别加速的文章中有讲解），或者将这个图片先上传到云存储上，再在云函数环境中再下来下来，这样也达到多次调用，减少网络间数据传递体积。


## 小结

下一篇文章中，我将介绍如何介绍Hi头像的核心功能“人脸五官分析”的配置以及腾讯云特色的人工智能服务。
