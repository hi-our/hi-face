---
title: 4.4 人脸贴纸移动技巧
---

本文知识点

* 图形移动的基本概念
* 图形移动
  * 拖拽移动图形
  * 旋转图形
  * 水平翻转图形
  * 移除图形
  * 确认


## 图形移动及事件代理
touch事件绑定-事件委托代理


图形拖拽的方案主要有两种：

* view（类似于web端的div）的拖动，难度较小，并且主图形内的四个边角上还能使用绝对定位放上可操作性元素。
* canvas 画布上的图形移动，有一些拖拽库可用，但我这里觉得，操作难度大，并且图形上可操作性元素还需要重新计算位置，比较麻烦。

我这里选择是view上用 CSS 的 `transform: translate(X, Y)` 来进行图片定位

在前文中，我提过我使用的 600px 对应 600rpx的方法，不仅便于计算，还在页面缩放时有好的效果。


### 底图

![](https://n1image.hjfile.cn/res7/2020/06/14/e3f90b96bedcb8116a25bb090a4000a7.png)

![](https://n1image.hjfile.cn/res7/2020/06/14/a20a4d02569195c3dea4979861377f1d.png)

在iPhone 6上的600rpx对应300px，在iPhone 5上就是256px，再后续还要有一次换算。

### 图形位置

在人脸五官分析时后的位置

```js
// 数据为随意写的
{
  // 图形id
  shapeId: 'xxx',
  // 图形宽度
  shapeWidth: 300,
  // 图形中间位置 X 轴
  shapeCenterX: 200,
  // 图形中间位置 Y 轴
  shapeCenterY: 200,
  // 旋转操作时的 X 轴的相对位置
  resizeCenterX: 240,
  // 旋转操作时的 Y 轴的相对位置
  resizeCenterY: 240,
  // 旋转角度
  rotate: 0,
  // 水平翻转，正向为1，反向为-1
  reserve: 1
}
```

```js
// 单个图形在view上的位置，transX、transY与 translateHat 有类似的逻辑
// 在 JSX 中的代码
let transX = shapeCenterX - shapeWidth / 2 - 2 + 'rpx'
let transY = shapeCenterY - shapeWidth / 2 - 2 + 'rpx'

let shapeStyle = {
  width: shapeWidth + 'rpx',
  height: shapeWidth + 'rpx',
  transform: `translate(${transX}, ${transY}) rotate(${rotate + 'deg'})`,
  zIndex: shapeIndex === currentShapeIndex ? 2 : 1
}
```

```jsx
// 图形位置
<View className='shape-container' key={timeNow} style={shapeStyle}>
```

图形上
```jsx
<View className='shape-container' key={timeNow} style={shapeStyle}>
  <Image className="shape-image" data-type='shape' data-shape-index={shapeIndex} src={imageUrl} style={shapeImageStyle} />
  {
    currentShapeIndex === shapeIndex && (
      <Block>
        <View className='shape-btn-remove' data-shape-index={shapeIndex} onClick={this.removeShape}></View>
        <View className='shape-btn-resize' data-shape-index={shapeIndex} data-type='rotate-resize'></View>
        <View className='shape-btn-reverse' data-shape-index={shapeIndex} onClick={this.reverseShape}></View>
        <View className='shape-btn-checked' data-shape-index={shapeIndex} onClick={this.checkedShape}></View>
      </Block>
    )
  }
</View>
```



* 核心算法：怎么实现口罩的实时转动
  * 当 touchstart 时，保存此时的 touch 起始点，并以此时的底图和口罩位置作为旋转角度和缩放比例值计算的参考点
  * 当 touchmove 时，根据起始点 和 临时的终止点 计算在 x/y 方向上的移动距离，计算参考点分别 加上这个距离，得到移动后的位置，通过移动前后的位置 计算移动前后位置的变动 计算旋转角和缩放比例
  * 当 touchend 时，重置底图和口罩的位置及旋转角和缩放比例


### 细节事件

> 以下内容，尚未完成

拖动
旋转
移除
水平翻转
确认效果
手动添加贴纸，图形移动
写出遗憾，感觉旋转那里有bug，还未很好复现




去除缩放比例

缩放比例，四个点就得分别计算
而用实际宽高及位置调整后，四个点就可以定位到正方形的四个角上。

有待思考，比较欠缺的地方？
canvas有类似的图形操作库，但div方式的，还未找到特别理想的！

参考 shape-edit仓库中的代码


px与rpx转换


