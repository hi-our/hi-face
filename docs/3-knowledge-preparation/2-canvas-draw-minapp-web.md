---
title: 3.2 Canvas绘制技巧，包含小程序与 Web 端
---

## 引入canvas元素

* Web端 canvas动态加入，也可以提前引入
* 小程序侧，只支持提前引入

### 代码演示
**Web端-canvas动态引入**
```js
var canvas = document.createElement('canvas')
canvas.width = img.width
canvas.height = img.height
var ctx = canvas.getContext('2d')
```

**Web端-提前写入**
```html
<canvas id="myCanvas"></canvas>
```
```js
var canvas = document.getElementById('myCanvas')
canvas.width = img.width
canvas.height = img.height
var ctx = canvas.getContext('2d')
```


**小程序侧**

```html
<canvas class="canvas-mask" canvas-id="myCanvas" style="width: 300px; height: 300px"></canvas>
```
```js
const ctx = wx.createCanvasContext('myCanvas')
```

**Taro上**
```html
<Canvas className='canvas-mask' style={{ width: '300px', height: '300px' }} canvasId='canvasMask'></Canvas>
```
```js
const ctx = Taro.createCanvasContext('canvasMask', this)
```

### Taro 源码解析
Taro 是在Web模拟了微信小程序上的`canvas-id`，以及获取context的方法。

```js
// 源码位置 Taro v2.x版本 packages/taro-h5/src/api/canvas/createCanvasContext.js
/**
* 创建 canvas 的绘图上下文 CanvasContext 对象
* @param {string} canvasId 要获取上下文的 <canvas> 组件 canvas-id 属性
* @param {Object} componentInstance 在自定义组件下，当前组件实例的this，表示在这个自定义组件下查找拥有 canvas-id 的 <canvas> ，如果省略则不在任何自定义组件内查找
*/
const createCanvasContext = (canvasId, componentInstance) => {
  const refId = `__taroref_${canvasId}`
  const component = findRef(refId, componentInstance)

  /** @type {HTMLCanvasElement} */
  const canvas = component.vnode.dom.querySelector(`[canvasId=${canvasId}]`)

  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext('2d')

  ...
  ...
}
```

## canvas环境获取
* 小程序侧 `wx.createCanvasContext(string canvasId, Object this)`
* web端 `var c=document.getElementById("myCanvas");var cxt=c.getContext("2d");`
* Taro上 `Taro.createCanvasContext(string canvasId, Object this)`


## canvas 元素绘制

* 线条、圆形、矩形，按照API写即可，差异不大
* 画图片 `drawImage`
  * 小程序侧，本地路径
    * base64和网路路径需要转换为本地路径
  * web端，img元素
    * onload引入后，无需关心图片是base64、本地路径
### 常用API

* save() 保留当前状态
* rotate() 以原点为中心顺时针旋转当前坐标轴。多次调用旋转的角度会叠加。原点可以用 translate 方法修改。
* restore()  恢复之前保存的绘图上下文。
### 画布绘制
* 微信上 `draw(boolean reserve, function callback)`
  * boolean reserve 本次绘制是否接着上一次绘制。即 reserve 参数为 false，则在本次调用绘制之前 native 层会先清空画布再继续绘制；若 reserve 参数为 true，则保留当前画布上的内容，本次调用 drawCanvas 绘制的内容覆盖在上面，默认 false。
  * function callback 绘制完成后执行的回调函数
* 各端区别
  * web端，实时绘制
  * 小程序侧，draw时再真正绘制
  * Taro上
    * 小程序侧，使用原生
    * web侧，draw时将前面状态以此执行 `packages/taro-h5/src/api/canvas/createCanvasContext.js`


## 画布导出图片

* web端 toDataURL()，生成带有图片质量的指定格式的base64数据
* 小程序 canvasToTempFilePath，生成本地路径
* Taro侧
  * 小程序侧，使用原生
  * web侧，`toDataURL()`转换为base64数据
## 保存图片
* 小程序侧 `wx.saveImageToPhotosAlbum()`
* Web端，生成图片，模拟点击，在电脑浏览器上OK，在微信app上不好用