---
title: 【草稿】深色模式在Web端的适配技巧，附带小程序侧的思考
---

最近，深色模式与浅色模式相当火，微信 App 增加了深色模式后，各大 App 都在跟进中。而我早在 19 年 8 月底就开始做深色模式的页面了。当时是 CCtalk 的视频播放页面。

![](https://n1image.hjfile.cn/res7/2020/04/04/784c03e42122586c3552b259368c1aa3.png)

当时首要问题就是想，深色、浅色模式在前端中的表现是什么呢？

## 色值

在《[紧跟潮流学设计：深色模式设计的 8 个小技巧](https://36kr.com/p/5231320)》中详细阐述了颜色设置上的技巧。

比如在 CCtalk 这边的浅色模式与深色模式的文字颜色

|   级别   | 浅色模式 |         深色模式         |
| :------: | :------: | :----------------------: |
| 重要文字 | #2f3742  |  rgba(255, 255, 255, 1)  |
| 普通文字 | #687583  | rgba(255, 255, 255, 0.8) |
| 辅助文字 | #95a1af  | rgba(255, 255, 255, 0.6) |

**为何什么深色模式下使用透明颜色?**
因为深色模式下的背景色不一定为特定的颜色，而文字使用透明颜色，背景色就会透过文字透明来渗出来，效果会更好。

**为何不直接使用`opacity`，这样更加直接**
因为文字 RGBA 颜色，不会对元素造成影响。而`opacity`是改变整个元素的透明度，会将整个元素的所有属性都造成影响，比如 `color` 、 `background`。
```css
.button {
  color: rgba(255, 255, 255, 0.8);
  background: #325ef6;
}

.button {
  opacity: 0.8;
  color: #fff;
  background: #325ef6;
}
```

![](https://n1image.hjfile.cn/res7/2020/04/05/6d40e1a279d9766c2d6bc0f702a02f9d.png)

```css
{
  /* 属性分开设置 */
  color: rgba(255,255,255,0.6);
  background: rgba(0,0,0,0.12);
}
```


## CSS 设置方法

深色、浅色模式有两种方向来考虑：

- **主题色**，即定义`theme-dark`与`theme-light`两套主题
- **全局统一色彩定义**，就是一种颜色修改后，全局全部变化，比如蓝色主题下链接颜色为`#325ef6`，而粉红色主题下链接为`#ff3271`，最好能统一定义。

常规的方案是用 [BEM 命名规范](https://www.cnblogs.com/jianxian/p/11084305.html) + `wrapper class`的方式。

```css
.theme-blue .button {
  color: #325ef6;
}

.theme-pink .button {
  color: #ff3271;
}
```

那如果一个页面有几十个 button，那这个颜色是不是要写几十遍呢？当然不是。

这里有这几种方案：

- 使用 CSS 预处理器
- 使用 CSS 变量
- 使用媒体查询 `@media(prefers-color-scheme: dark)`

### CSS 预处理器

使用 `Less`、`Scss`、`Stylus` 等 CSS 预处理器，可以快速实现定制主题色的方案。这里以 `Stylus` 为例。

> Stylus：富于表现力、健壮、功能丰富的 CSS 预处理器

```stylus
// 第一种写法
.theme-blue
  $button-color=#325ef6

  .button
    color $button-color

.theme-pink
  $button-color=#ff3271

  .button
    color $button-color
```

```stylus
// 第二种写法
// const-blue.styl
$button-color=#325ef6

// theme-blue.styl
@import "../../const-blue.styl"
.button
  color $button-color

// const-pink.styl
$button-color=#ff3271

// theme-pink.styl
@import "../../const-pink.styl"
.button
  color $button-color
```

也就是说，CSS 预处器在预先定义好颜色变量后，后续可以随意引用。当然，这里更加可以定义更多的功能，比如公共函数等。

使用了 CSS 预处理器的典型框架就是`BootStrap`，定制网址为：https://v3.bootcss.com/customize/

`Ant Design`已支持暗黑主题的定制，其配置方案与 `Bootstrap` 类似。https://ant.design/docs/react/customize-theme-cn

> **Ant Design of React** 是基于 Ant Design 设计体系的 React UI 组件库，主要用于研发企业级中后台产品。

### CSS 变量

那么，在不借助 CSS 预处理器的情况下，有没有原生的方法呢？答案就是 CSS 变量。

> 自定义属性（有时候也被称作 CSS 变量或者级联变量）是由 CSS 作者定义，它包含的值可以在整个文档中重复使用。由自定义属性标记设定值（比如： `**--main-color: black;**`），由 var() 函数来获取值（比如： `color: var(--main-color)`;）
> 复杂的网站都会有大量的 CSS 代码，通常也会有许多重复的值。举个例子，同样一个颜色值可能在成千上百个地方被使用到，如果这个值发生了变化，需要全局搜索并且一个一个替换（很麻烦哎～）。自定义属性在某个地方存储一个值，然后在其他许多地方引用它。另一个好处是语义化的标识。比如，`--main-text-color` 会比 `#00ff00` 更易理解，尤其是这个颜色值在其他上下文中也被使用到。  
> 自定义属性受级联的约束，并从其父级继承其值。

声明一个自定义属性：

```css
.element {
  --main-bg-color: brown;
}
```

使用一个局部变量：

```css
.element {
  background-color: var(--main-bg-color);
}
```

使用 CSS 变量的好处是动态改变。当元素被被优先级更高的 CSS 选择器定义时，就会被这上面的 CSS 变量所影响。

```css
.parent .element {
  background-color: var(--main-bg-color);
}
```

那么，CSS 兼容性如何呢？可以看张鑫旭早在 2016 年写的文章《[小 tips:了解 CSS 变量 var](https://www.zhangxinxu.com/wordpress/2016/11/css-css3-variables-var/)》。

![](https://n1image.hjfile.cn/res7/2020/04/04/8f538a4b0a343d46e7a9992e0f717d58.png)
也就是说，IE11 不支持。当然也有简单的 hack 的方式，但其实也挺麻烦的。就目前国内 Windows 7 系统占有比例还这么高的情况下，使用 CSS 变量的成本还是挺高的。

使用 CSS 变量的网站为苹果官网。
![](https://n1image.hjfile.cn/res7/2020/04/04/9fe803a21031baf6493cc70ee8797309.png)，其方案包含：

- `.theme-dark`标注深色模式
- CSS 变量快速定义全局样式和模块样式

### 使用媒体查询 `@media(prefers-color-scheme: dark)`

在《[H5 适配暗黑主题（DarkMode）全部解法](https://juejin.im/post/5dfb178f6fb9a0165f48fd18)》中简明扼要地讲解了使用媒体查询来完成适配深色模式的方案。

这里摘一点内容过来，

```css
body {
  background: #f2f2f2;
  color: #333;
}
@media (prefers-color-scheme: dark) {
  body {
    background: #222;
    color: #eee;
  }
}
```

这个方案在我们日常看的微信公众号文章已经得到了应用，其主要分这几个方面：

1. 位于 body 上的 CSS 变量声明全局样式
2. 使用`@media(prefers-color-scheme: dark)`来设置深色模式
3. 在 APP 的 `WebView` 中，使用`window.matchMedia("(prefers-color-scheme: dark)").matches`来判断设备启动了深色模式后，设置导航栏颜色`setNavigationBarColor`。

## 自动取色技巧

### 图片主体色彩

**方法一：通过图片存储商提供的方法来取色**

- 优点：速度快，性能好
- 缺点：图片存储上得提供这个方法才行

腾讯云数据万象通过 `imageAve` 接口获取图片主色调信息。目前支持大小在 20M 以内、长宽小于 9999 像素的图片处理。

![](https://n1image.hjfile.cn/res7/2020/04/04/269e02acf1314ea62737e069d932e72e.jpg)

访问 `https://cc.hjfile.cn/cc/img/20200325/2020032503285796778812.png?imageAve`即可获得以下结果

```json
{
  "RGB":"0xf68a61"
}
```

然后将 RGB 的颜色转换为 RGBA 的，这样的颜色略微浅一些。
给页面大容器设置背景时，背景色（`background-color`）为取色结果，而用了一层`background-image`的渐变色来作为遮罩。

```css
{
  background-color: rgba(155, 173, 185, 0.65);
  background-image: linear-gradient(rgba(28, 37, 50, 0.45) 0%, rgba(28, 37, 50, 0.7) 30%, rgba(28, 37, 50, 0.7) 100%);
}
```

> 这里也有一个小坑。`https://cc.hjfile.cn/cc/img/20200325/2020032503285796778812.png`这个地址正常为图片的地址，而如果当做接口来请求时，要保证网站与图片地址使用同样的`HTTPS`协议或`HTTP`协议。因为 HTTPS 是无法访问 HTTP 的接口的。

**方法二：借助 canvas 来获取主要色**

- 优点：不借助第三方服务
- 缺点：页面上同时获取多个 canvas 的色彩，会导致页面直接卡住，影响了正常浏览

### 图片高斯模糊

除了使用取色方案外，我们也可以使用高斯模糊的方案，其原理是用了 CSS 滤镜。CSS 滤镜还支持灰度、亮度等变化。

![](https://n1image.hjfile.cn/res7/2020/04/02/5d72b1a7c2de158c4638d7ece1c26549.png)

```html
<div class="bg" style="background-image: url(https://cc.hjfile.cn/cc/img/20180723/2018072309274407617842.jpg);">
  <div class="mask"></div>
</div>
```

```css
.bg {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(40px);
  height: 200%;
  width: 200%;
}

.bg .mask {
  background: rgba(0,0,0,.35);
  height: 100%;
  width: 100%;
}
```

关于 CSS 滤镜，这里有两篇文章。

- MDN-[filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter)
- [CSS3 filter(滤镜)属性及小程序 高斯模糊和 Web 的使用](https://blog.csdn.net/Ruffaim/article/details/84430792)中提及，CSS3 滤镜同样在小程序中也适用。

## `.theme-dark`在 React CSS Module 中如何传递

在 React 的项目中启动了 CSS Module，每个组件内的 `className` 都变得独一无二了。我在尝试中有了以下几个传递的方案。

- 设置 `:global` 来设置样式，但需要配合 `BEM` 命名规范，适合通用组件
- 通过 `props` 和 `context` 来传递，适合模块组件
- 通过 CSS 变量，因为不兼容 IE11，只能暂时放弃。

## 深色模式在 CCtalk 节目三合一页面的实际应用

在实际应用中，我做了多端适配。其包含了在智能手机、平板电脑、笔记本电脑，在 CCtalk 还包含了位于笔记本电脑上的 PC 客户端上的 UI 适配。

**智能手机：全屏深色模式**

![](https://n1image.hjfile.cn/res7/2020/04/04/784c03e42122586c3552b259368c1aa3.png)

**笔记本电脑：上深下浅**

![](https://n1image.hjfile.cn/res7/2020/04/04/6ac839a962c924e1d877d2b5305c0728.png)

**PC 客户端：全屏浅色模式**
![](https://n1image.hjfile.cn/res7/2020/04/04/db170b0cd7ddc8a400558d0014ea311f.png)

我想到了如下两个维度：

- 模式：触屏 mobile（`.ui-mode-mobile`）、大屏 pc（`.ui-theme-pc`）
- 主题色分布：全屏深色模式、全屏浅色模式、上深下浅（与各大视频网站播放页类似）

而我在考虑的时候，将主要适配罗列了一下

| 设备                  | 网页宽高  |        模式         |         主题色          |
| :-------------------- | :-------: | :-----------------: | :---------------------: |
| 手机 iPhone11 pro max |  414x896  |       mobile        |          深色           |
| iPad 7.9 寸           | 1024x768  |       mobile        |          深色           |
| iPad Pro 11 寸        | 1194x834  | 横屏 pc 竖屏 mobile | 横屏-上深下浅 竖屏-深色 |
| iPad Pro 12.9 寸      | 1366x1024 | 横屏 pc 竖屏 mobile | 横屏-上深下浅 竖屏-深色 |
| pc 客户端             | 1070x650  |       横屏 pc       |          浅色           |
| 笔记本                | 1280x800  |         pc          |        上深下浅         |

如果来做到区分 mobile 和 pc 呢，

1. 不支持 `onorientationchange` 横竖屏切换的，就认定为 pc，并且当浏览器拖动小了，支持左右滚动
2. 进入页面时，竖屏时以`window.innerWidth, window.innerHeight`中小的那个来判断，横屏中以`window.innerWidth, window.innerHeight`大的来判断，当宽度大于 `1040px` 时认为是`pc`，宽度小于 1040 时，认定为`mobile`。
3. 横竖屏切换时，重复第 2 步的判断

> `window.innerWidth, window.innerHeight`在安卓和 ios 上的横竖屏切换上有不一致的地方，所以以最大值或最小值来做更准确。
> `1040px`的宽度设定的依据为，恰好在 1024~1080 之间，又能兼顾 PC 客户端`1070px`的宽度（两侧有留白）。

```js
import React from 'react'

const mqlMedia = window.matchMedia('(orientation: portrait)')

function onMatchMediaChange(mql = window.matchMedia('(orientation: portrait)')) {
  if (mql.matches) {
    //竖屏
    // console.log('此时竖屏')
    return 'portrait'
  } else {
    //横屏
    // console.log('此时横屏')
    return 'horizontal'
  }

}
// 输出当前屏幕模式
const getUiMode = (uiMode = '', mql) => {
  if (uiMode) return uiMode

  if (!('onorientationchange' in window)) return 'pc'

  let status = onMatchMediaChange(mql)
  let width = status === 'portrait' ? Math.min(window.innerWidth, window.innerHeight) : Math.max(window.innerWidth, window.innerHeight)

  if (width > 1040) return 'pc'

  return 'mobile'

}

const getIsPcMode = (uiMode) => uiMode === 'pc'

/**
 * rem适配, 适用于移动端适配
 * @export
 * @param {*} Cmp
 * @returns
 */
export function withUiMode(Cmp, options = {}) {
  return class WithUIRem extends React.Component {
    constructor(props) {
      super(props)
      let uiMode = getUiMode()
      let isPCMode = getIsPcMode(uiMode)

      this.state = {
        uiMode: uiMode,
        isPCMode: isPCMode,
      }
    }

    componentDidMount() {
      mqlMedia.addListener(this.changeUiMode)
    }

    componentWillUnmount() {
      mqlMedia.removeListener(this.changeUiMode)
    }

    changeUiMode = (mql) => {
      let newUiMode = getUiMode('', mql)
      if (newUiMode !== this.state.uiMode) {
        this.setState({
          isPCMode: getIsPcMode(newUiMode),
          uiMode: newUiMode
        })

      }
    }

    render() {
      return <Cmp {...this.state} {...this.props} />
    }
  }
}


export default (options) => {
  return (Cmp) =>  withUiMode(Cmp, options)
}
```

## 深色模式在“CCtalk 课程”小程序中的实际运用

抖音 APP 的主题色为暗黑色，“CCtalk 课堂”也使用了类似的暗黑色。

> 安卓手机上搜“CCtalk 课堂”小程序才能搜到。

```js
class Self extends Taro.Component {
  config = {
    navigationBarBackgroundColor: '#0E1226',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '我的课程',
    backgroundColorTop: '#0E1226',
    backgroundColorBottom: '#0E1226',
    backgroundTextStyle: 'light'
  }
}
```

- `navigationBarBackgroundColor`，导航栏背景颜色
- `navigationBarTextStyle`，导航栏标题颜色，仅支持 black/white，同时影响：标题颜色、右胶囊颜色、左返回箭头颜色
- `backgroundColorTop`，顶部窗口的背景色，仅 iOS 支持
- `backgroundColorBottom`，同`backgroundColor`底部窗口的背景色，仅 iOS 支持
- `backgroundTextStyle`，下拉 loading 的样式，仅支持 dark/light

并且，在《[CSS3 filter(滤镜)属性及小程序 高斯模糊和 Web 的使用](https://blog.csdn.net/Ruffaim/article/details/84430792)》中提及，CSS3 滤镜同样在小程序中也适用




## 遗留问题

文章结构重新调整
1、小程序示例
2、总分总的结构
示例图片需要更换

色值这里
这里你想告诉人家两种不一样的
所以其实人家更多想看结果而不是代码
所以感觉你可以在右边放一个对比图

深色、浅色模式有两种方向来考虑：===>不太清晰





几个问题，
1. 标题不恰当，包含的内容比较丰富，建议是一个“颜色”为主题取个名字，不一定是暗色，因为内容包含了取色、多种配色适配方案等
2. 使用高斯模糊滤镜，在ios上会导致卡顿等问题
3. 敏感信息，包括截图、图片服务商地址信息等，最好都虚化处理