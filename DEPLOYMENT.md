
# DEPLOYMENT 部署文档

## 一、项目概述

此项目是在小程序和Web端使用 Taro 构建，功能服务基于[腾讯云](https://www.cloudbase.net/)[云开发](https://www.cloudbase.net/)及腾讯云人工智能服务，使用 CMS 内容管理系统来管理数据，基于 [Cloudbase Framework](https://github.com/TencentCloudBase/cloudbase-framework)完成小程序端、Web端、云函数端构建。

整体实践完此项目，可以帮助学习掌握云开发常用API在小程序、云函数、web端的使用；了解  CMS 内容管理系统和`@cloudbase/cli`的使用方法.

本项目的云开发环境由小程序侧创建。所以在开始此项目前需要注册一个微信小程序，当然也可以使用已有的小程序账号。

## 二、环境配置

### （1）准备阶段

如果没有小程序开发者工具，请[下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)并安装。导入此项目的代码，在导入框的 AppID 中填写已准备的小程序`AppID`。

导入后的开发者工具显示如下：

![](https://image-hosting.xiaoxili.com/img/img/20200911/34c56a64bc72684288a3800a78efe4e4-a47935.png)

#### 云环境ID

请参照 `.env.example` 文件，在项目根目录配置 `.env` 和 `.env.dev` 文件

```makefile
# 小程序 appid，在小程序项目和小程序部署中使用
APP_ID=xxxID
# 云环境 ID
ENV_ID=xxxID
SERVER_ENV=dev # 开发环境：dev 生成环境：prod

# 在云数据库导入中用，具体可以看 cloud/database
#腾讯云安全 secretID和 secretKey，可以从 https://console.cloud.tencent.com/cam/capi 获取
TCB_SECRET_ID=xxx
TCB_SECRET_KEY=xxx
```

* `APP_ID` 小程序 appId
* `ENV_ID` 云环境 ID
* `SERVER_ENV` 是在 Taro 项目中区分开发环境还是生产环境

#### 小程序版本 Version

在`taro/src/config.js`配置，便于线上查看版本

#### 需要开通的服务

在头像编辑页需要图像安全审核、人脸五官分析两个服务，请在微信服务平台开通。

* [图像安全审核](https://developers.weixin.qq.com/community/servicemarket/detail/000a246b6fca70b76a896e6a25ec15)
* [五官定位](https://developers.weixin.qq.com/community/servicemarket/detail/000808a09b85c8e39aa94b1c65d015)

### （2）云开发环境部署

打开开发者工具左上角【云开发】，进入云开发控制台。如果小程序没有创建过云开发，需要先开通并创建云开发环境。

开发环境：用于功能开发和测试。建议先创建开发环境，因为云函数本地调试默认调用创建的第一个云环境。

生产环境：用于正式上线后的功能维护和数据存储。

#### 按量计费

当有云开发环境时，需要在设置页中点击【开通按量计费】

![](https://image-hosting.xiaoxili.com/img/img/20200911/a983e50400151acc1ea19ebba0c3579d-2ab28d.png)



在操作后，即将云开发环境转换为按量计费（按量计费仍然有免费额度，和基础版预付费一致，无需担心）

在浏览器中，打开[腾讯云控制台](https://cloud.tencent.com/login/mp?s_url=https%3A%2F%2Fconsole.cloud.tencent.com%2Ftcb),使用微信扫描二维码，选择当前小程序账号进行授权。

#### 静态网站托管

登录后选择刚按量付费的环境，点击进入，在左侧栏中点击静态网站托管，在页面中开启静态网站托管。

>在 CMS 内容管理系统和 Web 版Hi头像中所需

![](https://image-hosting.xiaoxili.com/img/img/20200911/1831e159287fd0326058c806cd77ab0a-feff64.png)

大约需要3分钟左右才会开通完毕。

关闭浏览器控制台！重新关闭并打开小程序开发工具的云开发控制台，就会发现多了一个静态网站托管的TAB。

![](https://image-hosting.xiaoxili.com/img/img/20200911/a6df95d1922e0e97a8465a3d754326cd-0751b3.png)

#### 登录鉴权（匿名登录 + 自定义登录）

>Web版所需。若仅部署小程序端，则不需要。

点击左侧的环境-登录鉴权，在页面中将匿名登录开启。

![](https://image-hosting.xiaoxili.com/img/img/20200911/a0552801a7d4cd1cd169fafaf3f5d1dd-0d5256.png)

#### CMS 内容管理系统

在云开发管理中安装cms 内容管理系统，其中需要下载自定义登录私钥。（建议本地保留一份，因为很多个地方需要用）

![](https://image-hosting.xiaoxili.com/img/img/20200911/b05d6695c39854b8010fdcfd282b65ae-027a12.png)

## 三、服务端

### 云开发数据库的创建

>数据集合名称尚未改名，以下方案为部署文档的预研版
#### 方案一：在云数据库手动创建

在云开发控制台-数据库中，新建6个集合，分别为


* hiface-configs | 全局配置，如配置默认显示的主题
* hiface-users | 用户
* hiface-themes | 主题列表，如国庆、圣诞
* hiface-shape-categories | 贴纸分类，可以属于多个主题
* hiface-shapes | 贴纸，可以属于多个贴纸分类
* hiface-avatars | 头像，用户生成
#### 方案二：在 CMS 管理后台创建

按照 `cloud/database/model`中所示的主题结构进行手动创建。

>从CMS 导入数据模型的功能，在 CMS v2 中处于开发中。

![](https://image-hosting.xiaoxili.com/img/img/20200911/ce081059e46ea9d91a34101af20a2d24-ded751.png)

#### 方案三：数据模型快速生成，需要安装Cloudbase Cli

>目前在 CMS v1 版中有一点小问题，CMS v2版数据模型跟 v1 不太一样，还未完全测试。

Hi 头像数据管理基于 Cloudbase CMS 内容管理扩展，需要在云开发 cloudbase 控制台下方扩展能力中开通。

```shell
# 安装Cloudbase Cli，目前我用的是测试版
npm install -g @cloudbase/cli@beta

# 授权云函数所在的腾讯云账号
tcb login

# 部署生产环境的数据模型，需要在 .env 文件中配置 ENV_ID
npm run deploy:init-db
# 或者，部署开发环境的数据模型，需要在 .env.dev 文件中配置 ENV_ID
npm run deploy:init-db:dev
```

#### 方案四：数据模型快速生成，需配置 腾讯云 secretId 和 secretKey

>目前在 CMS v1 版中有一点小问题，CMS v2版数据模型跟 v1 不太一样，还未完全测试。

Hi 头像数据管理基于 云开发 CMS 内容管理扩展，需要在云开发cloudbase 控制台下方扩展能力中开通。

```
cd cloud/database
npm install
npm run init-db
```
![](https://image-hosting.xiaoxili.com/img/img/20200911/145016609594c92fca0e51fe573782ee-2b3607.png)

### 云开发云函数的部署


* `hiface-api`主要的接口请求 API
* `analyze-face`Web 端五官分析和图形安全审核，在小程序端基于服务市场的五官分析公服务。如果只部署微信小程序端，则无需部署。
#### 方案一：微信开发者工具

在小程序开发者工具中，打开`cloud/functions`目录，将所有的子目录，均右键，在菜单中点击“上传并部署：云端安装依赖”。

优点：简单方便，便于本地调试

![](https://image-hosting.xiaoxili.com/img/img/20200911/6690dc51aae97c409a89932ae0097398-687e28.png)

#### 方案二：使用命令快速部署

开发环境：`npm run deploy:devweb`

正式环境：`npm run deploy:web`

**原理解析**

Web端上线部署基于[Cloudbase Framework](https://github.com/TencentCloudBase/cloudbase-framework)来完成，需要安装云开发`@cloudbase/cli`，具体可以查看`cloudbaserc.json`中的配置。

## 前端调试部署

### 页面文件结构

在`taro/src`中，有以下文件

```
|-config.js 配置AppId、云环境Id及其它
|-components 全局组件
|-pages
|-|- avatar-edit 头像编辑页
|-|- avatar-poster 头像分享页
|-|- theme-list 主题列表
|-|- self 我的，含个人头像列表
```

### 小程序端调试

小程序端调试已经被封装成以下命令：
> 在 `taro/` 目录 `package.json` 中定义的这几个命令

```
开发环境调试 npm start
生产环境调试 npm run build
生产环境编译 npm run release
```

完整调试技巧，请查阅[Taro 安装及使用](https://taro-docs.jd.com/taro/docs/2.2.13/GETTING-STARTED)

### 小程序端部署

方法一：微信开发工具上传


方法二：微信 CI 上传

文档：[https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)

示例：

![](https://image-hosting.xiaoxili.com/img/img/20200911/6b7e858b51f95138e899ca80bd9b8ec3-a3f360.png)

在使用CI之前，需要先前往mp平台下载上传密钥，具体操作方式，可以[点击前往](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)

然后还要修改`project.config.json`的`appid`，密钥和`appid`要对应上才可以

进入到项目目录，在命令行执行

```plain
// 部署开发版，默认生成二维码
npm run wxci:preview
// 部署体验版，直接上传到mp平台
npm run wxci:upload
```

### Web端部署

开发环境：`npm run deploy:devweb`

正式环境：`npm run deploy:web`


**原理解析**

Web端上线部署基于[Cloudbase Framework](https://github.com/TencentCloudBase/cloudbase-framework)来完成，需要安装云开发`@cloudbase/cli`，具体可以查看`cloudbaserc.json`中的配置。

```plain
npm install -g @cloudbase/cli@latest
```
## TODO：

- [ ] 快速生成数据模型
    - [ ] v1 所属主题有问题
    - [ ] v2 cms中未显示对应的数据模型
- [ ] 云函数部署，framework的方式还有点问题
## 参考文档：


* Cloudbase 官方文档[https://www.cloudbase.net/](https://www.cloudbase.net/)
* Taro 官方文档[https://taro.jd.com/](https://taro.jd.com/)
* Framework 官方文档[https://github.com/TencentCloudBase/cloudbase-framework](https://github.com/TencentCloudBase/cloudbase-framework)
* Framework模式切换[https://github.com/TencentCloudBase/cloudbase-framework/blob/master/doc/mode.md](https://github.com/TencentCloudBase/cloudbase-framework/blob/master/doc/mode.md)
### 




