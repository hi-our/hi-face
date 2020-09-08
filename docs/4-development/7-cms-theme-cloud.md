---
title: 4.7 CMS扩展实战-节日主题贴纸放在云开发
---

## 云开发扩展能力介绍

云开发扩展能力是云开发团队为开发者提供的一站式云端服务，旨在降低开发者使用云服务的门槛，助力开发者快速开发应用。目前已经对外支持的有图像处理、图像安全审核、图像盲水印、图像标签等。

今天说的是新推出的“CMS内容管理系统”，以下简称“CMS”。

> 为方便开发人员和内容运营者，随时随地管理小程序/ Web 等多端云开发内容数据，支持 PC/移动端浏览器访问，支持文本、富文本、图片、文件、关联类型等多种内容类型的可视化编辑。

**功能特性**

| 特性         | 介绍  |
| ------------ | ------------------ |
| 免开发       | 基于后台建模配置生成内容管理界面，无须编写代码  |
| 多端适配     | 支持 PC/ 移动端访问和管理内容  |
| 功能丰富     | 支持文本、富文本、图片、文件 等多种类型内容的可视化编辑，并且支持内容关联 |
| 权限控制     | 系统基于管理员/运营者两种身份角色的访问控制  |
| 外部系统集成 | 支持 Webhook 接口，可以用于在运营修改修改内容后通知外部系统，比如自动构建静态网站、发送通知等 |
| 数据源兼容   | 支持管理小程序/ Web / 移动端的云开发数据，支持管理已有数据集合，也可以在 CMS 后台创建新的内容和数据集合 |
| 部署简单     | 可在云开发控制台扩展管理界面一键部署和升级  |

![CMS](https://main.qcloudimg.com/raw/d9261d6f06846dbbef939b441fa7c3fa/article-list.png)

## 小程序功能实战


### CMS 数据源兼容已有数据表

> 支持管理小程序/ Web / 移动端的云开发数据，支持管理已有数据集合，也可以在 CMS 后台创建新的内容和数据集合

也就是说，你先前已经做了数据库存储的话，这次只要在“内容设置”中将数据表的表名称、字段名再重新声明一次即可，不会对线上数据造成影响。（每次修改完表结构，记得刷新页面）

我这次对我的用户管理表和用户头像表都进行了字段改造，主要是从蛇形命名法（user_id）（user_id）全部改为小驼峰命名法（userId），也是跟自带的创建时间（createTime）和更新时间（updateTime）保持一致，这样在UI侧（web和小程序）、云函数、CMS以及云数据库上管理字段，都是统一的字段命名方案，在代码编程时会更加方便。

> 其实在 MySQL 数据库中，是需要用蛇形命名法（user_id），在 Java 的逻辑中会将蛇形命名法转换为小驼峰命名法。而在 NOSQL 数据库中，可以直接小驼峰命名法，这种不仅可以简化字段名转化，也对以 JavaScript 为主的 Web云开发和小程序云开发人员来说非常友好。

![](https://n1image.hjfile.cn/res7/2020/05/16/be263cf5ed57e7399904ff7072cb4665.png)

细心的同学会发现，这次CMS系统主要用的是单层的数据表结构，后续应该支持嵌套。

### CMS 支持图片类型，让素材图片从本地到云存储

Hi头像的基础功能是在人脸图片上叠加贴纸素材。

*  微信小程序canvas画图是需要用到本地路径的图片
*  微信小程序ios设备上Canvas画图不支持水平翻转

所以当时将图片放在本地，每个图片有正反两个方向。痛点也随之而来，本地图片不仅占用小程序包的体积，后续功能升级后，维护起来也比较麻烦。

这次将图片放在云存储上，在数据库内保存`couldID`。在使用时，在云函数侧将`couldID`转换成真实图片地址Url，在`Canvas`画图时将图片Url转换成本地路径来使用。

![](https://n1image.hjfile.cn/res7/2020/05/16/71dec0f65d069d4a0b15f4776eeb6be8.png)

### CMS 支持多表，可以建立字段关联表，促进Hi头像的创意升级

Hi头像先前做过两个主题活动，分别为戴口罩和女王节戴皇冠，在本地页面写了2个页面，并且每个页面都有各自的页面配置。那之后又想多增加几个节日或者主题活动，是不是要每次都在小程序代码里增加新的页面配置呢？

这次，我将借助“CMS内容管理系统”来完成。

**字段词典**

* 头像编辑页：负责头像编辑功能，每次有一个主题活动
* 主题：围绕一个主题来组织贴纸、相框、页面背景、主题色等，主题为节日、有趣的活动（暑期降温）等
* 贴纸分类：将贴纸进行分类显示
* 贴纸：贴在人脸上或头像内，位置类型分为额头、嘴巴、其他，头像内可以允许多个

![](https://n1image.hjfile.cn/res7/2020/05/16/1c9774d41914814fe2fd0d1271db5d3e.png)

那么，除了常见的几种类型外，cms还支持富文本、markdown等高级格式，以及关联型，也就是将一个字段与另外的一个表继续关联

比如说，贴纸分类属于多个主题，贴纸属于多个贴纸分类，如此就可以复用贴纸啦。

### CMS 多表结构需要使用联表查询

因为 CMS 初期是依据关系型数据库的建模，在后续应该会增加“NoSQL”的嵌套方式。

> 聚合阶段。聚合阶段。联表查询。与同个数据库下的一个指定的集合做 `left outer join`(左外连接)。对该阶段的每一个输入记录，`lookup` 会在该记录中增加一个数组字段，该数组是被联表中满足匹配条件的记录列表。`lookup` 会将连接后的结果输出给下个阶段。
> API 文档： [Aggregate.lookup](https://docs.cloudbase.net/api-reference/server/node/database/aggregate/stages/lookup.html)

那么，本次使用 CMS 的重中之重自然是，Hi头像小程序“头像编辑页”的数据获取。

1. 从“配置表”中查询到当前想显示的主题（`themeId`）
2. 从“主题”表中查询到对应的主题配置，包含主题名称、分享信息等。

上面这两步还比较简单，通过2次查询即可。

```js
let { themeId } = event

if (!themeId) {
  let configRes = await cloud.callFunction({
    name: 'collection_get_configs',
    data: {
      configName: 'avatar-edit'
    }
  })

  let result = configRes.result.data
  themeId = result.themeId
}

if (!themeId) {
  return {
    data: '',
    status: -20001,
    message: '未成功设置themeID',
    time: new Date()
  }
}

const { errMsg, data } = await db.collection('themes').doc(themeId).get()
console.log('result :>> ', data)
```

在确认有对应的主题后，就要进行进行聚合查询了。

主要是通过查询贴纸分类表（`shape_categories`），并且联表查询（`Aggregate.lookup`）贴纸表（`shapes`）。

```js
if (errMsg === 'document.get:ok') {
  let { errMsg: categoryErrMsg, list: shapeCategoryList } = await db.collection('shape_categories').aggregate()
    .match({
      belongThemes: themeId
    })
    .lookup({
      from: 'shapes',
      localField: '_id',
      foreignField: 'belongShapeCategory',
      as: 'shapeList'
    })
    .end()
}
```