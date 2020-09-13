---
title: 小程序云开发环境部署静态网站托管的实战
---

## 静态网站托管简介

静态网站托管（Website Hosting，WH）是由云开发提供的便捷、稳定、高拓展性的托管服务，您无需自建服务器，即可一键部署网站应用，将静态网站发布到全网节点，轻松为您的业务增添稳定、高并发、快速访问等能力。此外，您还可以结合云开发的云函数、数据库等能力，将静态网站扩展为带有后台服务端的全栈网站，让您可极速提供网站应用。

在我最近的文章提及的“CMS内容管理系统”是一个React项目，其安装位置在“静态网站托管”的`tcb-cms`目录中。

![](https://n1image.hjfile.cn/res7/2020/05/16/73218903cb830323ce1ae65a5452ceb8.png)

这次我就想借助[TencentCloudBase/cloudbase-action](https://github.com/TencentCloudBase/cloudbase-action)来完成 Web 端项目的持续集成工作。


### 云开发的环境设置

首先，我在小程序云开发有两套环境，在发布到web端也会有这两套环境。

* `development`，对应着开发环境，其网址为 https://yzface.hi-our.com
* `production`，对应着生成环境，其网址为 https://face.hi-our.com

在我的 `Taro` 版仓库中，我配置了 `SERVER_ENV` 这个变量来设置当前输出的是什么环境。

```js
// config.js
const env = process.env.SERVER_ENV || 'prod'
module.exports = {
  env,
  cloudEnv: env === 'prod' ? 'production-xxxxx' : 'development-xxxxx',
}

// app.js
if (process.env.TARO_ENV === 'h5') {
  Taro.cloud = tcb.init({
    env: config.cloudEnv
  })
}
```

`Taro` 仓库的编译命令：

```json
{
  "scripts": {
    "release:yzweb": "SERVER_ENV=yz NODE_ENV=production npm run build:h5",
    "release:web": "SERVER_ENV=prod NODE_ENV=production npm run build:h5"
  }
}
```
> **这里补充一些关于 Taro 的信息**  
> Taro 是一套遵循 React 语法规范的 多端开发 解决方案。    
> 使用 Taro，我们可以只书写一套代码，再通过 Taro 的编译工具，将源代码分别编译出可以在不同端（微信/百度/支付宝/字节跳动/QQ/京东小程序、快应用、H5、React-Native 等）运行的代码。


### 持续集成部署

在 [TencentCloudBase/cloudbase-action](https://github.com/TencentCloudBase/cloudbase-action) 中说明了需要在 `github action` 中配置`secretId`、`secretKey`、`envId`这几个环境变量，但一个 `action` 配置显然无法完成开发、生产两套环境的持续集成。

![](https://n1image.hjfile.cn/res7/2020/05/16/96d9e1a11bc76b0f167b7c1cf3503169.png)


我这里给出我的设置

* `1.x-stable` 分支：上线验证通过后的代码
* `deploy/cloudbase-development` 分支：开发测试环境的代码，其 `action` 文件为 `cloudbase-development.yml`
* `deploy/cloudbase-production` 分支： 正式生产环境的代码，其 `action` 文件为 `cloudbase-production.yml`

```yaml
name: deploy-cloudbase-development # Github Actions 显示的名称

on:
  push:
    branches: [ deploy/cloudbase-development ] # push到该分支后触发action
  pull_request:
    branches: [ deploy/cloudbase-development ] # pr到该分支后触发action

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [10.x, 12.x]

    steps:
    - uses: actions/checkout@v2 # 拉取最新代码
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - run: cd taro/
    - run: npm i
    - run: npm run release:yzweb --if-present # 编译代码
    - name: Deploy static to Tencent CloudBase # 部署到腾讯云云开发cloudBase的静态网站托管上
      id: deployStatic
      uses: TencentCloudBase/cloudbase-action@v1.1.0
      with:
        secretId: ${{ secrets.SECRET_ID }}
        secretKey: ${{ secrets.SECRET_KEY }}
        envId: ${{ secrets.ENV_ID_DEVELOPMENT }} # 注意环境ID为开发环境
        staticSrcPath: taro/dist-h5/

```

### 绑定域名

**绑定自定义域名**

> 默认域名仅供测试使用，限制下行速度100KB/S。如您需要对外正式提供网站服务，请绑定您已备案的自定义域名。

* `development`，对应着开发环境，其网址为 https://yzface.hi-our.com
* `production`，对应着生成环境，其网址为 https://face.hi-our.com


**设置安全域名**
在 “环境 => 安全设置 => WEB安全域名” 中绑定对应的测试域名及自定义域名。

## 文章相关内容：

我是 **盛瀚钦**，沪江 CCtalk 前端开发工程师，Taro 框架的 issue 维护志愿者，腾讯云云开发布道师，主要侧重于前端 UI 编写和团队文档建设。

最近组建了HiOur开源团队，主要开发Hi头像小程序及相关教程，与云开发 Cloudbase合作举行云开发月度挑战赛。

官网为：https://hi-our.com


## 参考文章

* [如何通过 Github Action 获取静态资源部署服务](https://mp.weixin.qq.com/s/9aAFhbyqcFu91lzA46qUEg)

