# Hi头像

让头像有趣一点

## 核心亮点

| 特性        | 介绍                                  |
| ----------- | ------------------------------------ |
| 云开发      |基于腾讯云云开发，易部署、扩展性很好                                 |
| 人工智能 | 基于腾讯云的人脸五官分析服务自动为头像戴皇冠、圣诞帽或口罩，支持多人识别 |
| 多端运行 | 基于 Taro 打造，有微信小程序端和 Web 端 |
| 用户体验好 | UI设计精美，易于操作，交互动画友好且动感 |
| 部署文档详细 | 本项目的部署文档非常详细，详情请查看《[DEPLOYMENT](https://github.com/hi-our/hi-face/blob/master/DEPLOYMENT.md)》文档 |
| 数据管理方便 | 使用 CloudBase CMS 管理数据，并贴心地给出初始化数据模型及默认数据 |
| 前端工程化 | 核心配置已抽取，基于 Cloudbase Framework 完成云函数、Web 端 和小程序端部署|
| 技术小册 | 独家拥有技术小册《**[从0到1开发一个智能头像识别小程序](https://www.xiaoxili.com/hi-face/docs/README.html)**》，详细说明 Hi 头像主要实现思路 |


## 功能体验

小程序二维码

![](https://image-hosting.xiaoxili.com/img/img/20200911/6f53bfa6573da16bec899f169fe58ae4-977c15.png)

Web 体验版：[https://face.xiaoxili.com](https://face.xiaoxili.com)

**DEMO 体验版**
前台功能：https://face-demo.xiaoxili.com
CMS 数据体验：https://face-demo.xiaoxili.com/tcb-cms/
账号： cmsAdmin
密码： cmsAdmin123==

如有问题，可以提 Issue
请勿修改密码，上传敏感数据。环境数据可能会被清空，勿做私人使用。

## 愿景

### 使用场景&目标用户&背景

在节日的时候，我们可以使用符合节日七夕的头像，比如在国庆节使用含国旗的头像表达对祖国的祝福；在圣诞节的时候，我们能给亲朋送一个带圣诞帽的头像传递快乐。

### 需求分析

在一些特定节日里，很多人尤其是年轻人喜欢新潮的头像，比如近几年的圣诞节，会有“@官方微信，送我一顶圣诞帽“的需求，对此，我们做这个小程序，来解决特定时候头像的制作。

### 设计理念

**标语：让头像有趣一点**

「Hi头像」结合节日特点，微信头像进行智能化处理，让头像更加符合节日氛围。

1、紧跟节日热点

国庆节头戴国旗、圣诞节智能戴帽子，增加节日乐趣

2、简单易操作

不同于各类app的繁琐，小程序更简洁易操作

3、乐于分享

借助微信社交机制，头像处理后可以分享给好友或分享到朋友圈，展示头像成果

### 用户画像

20-35喜欢分享的年轻人


### 作品效果图
![](https://image-hosting.xiaoxili.com/img/img/20200921/6562b94a148b112a6c6b092821bee6f3-4768c7.png)
![](https://image-hosting.xiaoxili.com/img/img/20200921/236e9b57e5c2a8ad170c1edada9c2724-149cab.png)

### 产品介绍视频

[#小程序云开发挑战赛# Hi头像小程序介绍视频-完整版](https://v.qq.com/x/page/l3152qjx9e8.html)


## 主创人员

**小溪里，技术研发**

个人网站：[https://www.xiaoxili.com](https://www.xiaoxili.com)

公众号：小溪里


**不二雪，UI设计**

<!-- 作品集地址：待补充 -->

公众号：不二诗旅

## 技术栈
* ❤️ UI侧 —— Taro，文档见 https://taro.jd.com/
* ❤️ 服务 —— 云开发 CloudBase，文档见 https://docs.cloudbase.net/
* ❤️ 部署 —— 基于 CloudBase Framework 完成小程序端、Web端、云函数、数据模型构建，官网见 https://cloudbase.net/framework.html
* ❤️ 内容管理 —— 基于 CloudBase CMS 管理数据，文档见 https://docs.cloudbase.net/cms/intro.html


## 部署文档

本项目的部署文档非常详细，详情请查看《[DEPLOYMENT](https://github.com/hi-our/hi-face/blob/master/DEPLOYMENT.md)》文档。


## RoadMap

🚀 表示已经实现的功能，👷 表示进行中的功能，⏳ 表示规划中的功能，🏹 表示技术方案设计中的功能。

| 功能                                                     | 状态      | 发布版本 |
| -------------------------------------------------------- | --------- | -------- |
| UI 重构、页面流程优化                                        | 🚀 已实现 | V2.0     |
| 云函数合并，使用 `tcb-router` 进行路由匹配        | 🚀 已实现 | V2.0     |
| 使用 `cloudbase-framework` 来发布 Web 端、云函数    | 🚀 已实现 | V2.0     |
| 使用 `cloudbase-framework` 来部署小程序的预览、体验版      | 👷 进行中 | V2.0     |
| Cloudbase CMS v1 版数据模型快速生成集合字段      | 🚀 已实现  | V2.0     |
| Cloudbase CMS v2 版数据模型快速生成集合字段及提供默认数据      | ⏳ 规划中  | V3.0     |
| 贴纸编辑器调研      | 🏹 设计中  | V3.0     |
| 海报换为 `canvas 2d` 版      | 🏹 设计中  | V3.0     |
| Web 版云开发登录鉴权设计      | 🏹 设计中  | V3.0     |
| 云环境共享调研      | 🏹 设计中  | V3.0     |
| 更多的腾讯云人工智能服务      | 🏹 设计中  | V3.0     |



## 贡献榜

阅读我们的贡献指南，让我们一起建立一个更好的头像小程序。

我们欢迎所有贡献。 请先阅读我们的 《[CONTRIBUTING.md](https://github.com/hi-our/hi-face/blob/master/https://github.com/hi-our/hi-face/blob/master/CONTRIBUTING.md.md)》。 您可以提交任何想法到[pull requests ](https://github.com/hi-our/hi-face/pulls)或[ GitHub issues](https://github.com/hi-our/hi-face/issues)。 如果您想改善代码，请查阅《[DEPLOYMENT](https://github.com/hi-our/hi-face/blob/master/DEPLOYMENT.md)》文档，祝您玩得愉快！ :)

## 特别鸣谢

从 v1到v2版迭代过程中，有4位同学参与了一些工作。


* [王宝国](https://github.com/wangbaoguo88)：产品助理，撰写了 v1.0 的产品文档
* [李欢](https://github.com/huan-x)：开发助理，编写了 v1.x 中原生小程序的人像魅力、图片标签等页面
* [任乐乐](https://github.com/wolf-lang)、[康鸿](https://github.com/daxiakang)：协助 v2.0 版的功能测试
* [忍者无敌](https://github.com/LoserTeach)：协助 v2.0 部署文档内容的补充

若想贡献代码或者提供建议，请先查阅《[CONTRIBUTING](https://github.com/hi-our/hi-face/blob/master/https://github.com/hi-our/hi-face/blob/master/CONTRIBUTING.md.md)》文档。

## 开发交流

[官方交流微信群](https://github.com/hi-our/hi-face/issues/43)

## 更新记录

本项目遵从[Angular Style Commit Message Conventions](https://gist.github.com/stephenparish/9941e89d80e2bc58a153)，更新日志请查阅 《[CHANGELOG](https://github.com/hi-our/hi-face/blob/master/https://github.com/hi-our/hi-face/blob/master/CHANGELOG.md.md)》

## 学习资源

《**[从0到1开发一个智能头像识别小程序](https://www.xiaoxili.com/hi-face/docs/README.html)**》

>本技术小册基于Hi 头像 v1版本编写，v2 版本正在撰写中。

从产品功能规划、技术选型到实战开发，全方位介绍基于小程序云开发来实现智能人像识别小程序，不仅能完成跨端开发，更能学习到当今炙手可热的 ServerLess 开发实战（即小程序与 Web 云开发），更能将高深的人工智能技术落地到真实项目中，甚至，我们还将探索如何将小程序与Web端完成前端工程化实践。

**你会学到什么？**


* 小程序云开发配置与开发技巧，亲历云开发的实战场景
    * 基于 tcb-router 封装多功能的 API 服务
    * 基于静态网站托管部署 Web 版
    * 基于 CMS 内容管理系统来统一管理数据
    * 基于 Cloudbase-Framework 来部署云函数、小程序和 Web 端
* 体验及实战腾讯云人工智能特色功能，如人脸识别、五官分析、人像转换等
* Taro 跨端使用技巧，在实战中了解Canvas在小程序与web端的差异，以及图片裁剪、压缩、上传的各种技术细节
* 产品需求、项目规划的实战知识
## 项目综述

本项目在小程序和Web端使用 Taro 构建，功能服务基于[腾讯云云开发](https://www.cloudbase.net/)及腾讯云人工智能服务，使用 CMS 内容管理系统来管理数据，基于[Cloudbase Framework](https://github.com/TencentCloudBase/cloudbase-framework)完成小程序端、Web端、云函数端构建。

## 架构图

### 整体关系图

![](https://image-hosting.xiaoxili.com/img/img/20200911/ba367852e79f4acfcbc15855adca3545-3ed2a1.png)

### 页面间调用关系图

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

![](https://image-hosting.xiaoxili.com/img/img/20200911/8eac43d66cafebcdd0eb76042f414572-e11a3a.png)

### 头像编辑页流程图

头像编辑是Hi 头像的主逻辑，下面这个流程图充分展示了从加载主题数据、到头像编辑、再到头像生成的完整流程。

Hi 头像功能以小程序端为主，功能齐全，而在 web端能制作头像并保存图片，暂不提供头像保存和分享功能。

![](https://image-hosting.xiaoxili.com/img/img/20200917/19cd0697d023f9bb6f0836a1ee35a2dc-df21f2.png)

### 五官分析时序图

v1版中使用图示“第五版”时序图来完成主逻辑，而v2版中使用“第六版”时序图，这两者差异点就是基于已有服务来完成功能，更容易初学者掌握。

![](https://image-hosting.xiaoxili.com/img/img/20200917/c4ea86ffa18c6bead6cffa6a76d9b926-f19204.png)

### 核心语法

1、云函数`hiface-api`基于`tcb-router`做路由跳转

主要功能有头像、主题、用户信息的获取与更新，还有创建小程序码的功能。

路径为`cloud/functions/hiface-api`

2、核心算法

基于五官分析为多个人脸戴上贴纸，具体可以查看《[通过五官分析实现为人脸佩戴贴纸](https://www.xiaoxili.com/hi-face/docs/4-development/3-analyze-face-shape.html)》

## License

* 前后端技术源码为 MIT License
* 页面UI设计版权为作者不二雪所有，如玫红色UI、含小象logo的背景图等
* 节日主题及贴纸来源为 iconfont，版权归原作者所有
* 依据 Hi 头像完整功能进行上线时，请在页脚备注“技术支持来自小溪里”

Copyright (c) 2020 Hanqin
