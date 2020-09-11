---
title: 【草稿】小程序框架：Taro 2.0与Taro 3.0的核心分析
---

## 文章大纲

* React与Nerv适配差异
* 功能排查列表
* 项目上线安排
* 新版本的特色
  * 编译速度更快
  * 抽象语法树那一层更统一？

## 编译图
![图片](https://uploader.shimo.im/f/HU5S9ohp07wkWtXY.png!thumbnail)

## 编译工作流与抽象语法树（AST）
### **编译时**
Taro 的核心部分就是将代码编译成其他端（H5、小程序、React Native 等）代码。一般来说，将一种结构化语言的代码编译成另一种类似的结构化语言的代码包括以下几个步骤：

![图片](https://uploader.shimo.im/f/yttbqf6ii44zEccd.png!thumbnail)

首先是 Parse，将代码解析（Parse）成抽象语法树（Abstract Syntex Tree），然后对 AST 进行遍历（traverse）和替换(replace)（这对于前端来说其实并不陌生，可以类比 DOM 树的操作），最后是生成（generate），根据新的 AST 生成编译后的代码。

在本章我们探索了代码究竟是什么：一段结构化的文本，本质是一种叫抽象语法树的复杂拓扑数据结构。也就是说只要我们在简单的情况把代码当做字符串处理，在复杂的情况把代码当做数据处理，这样几乎就可以把一段代码转译成任意的字符串（或数据结构）。我们还介绍了 Babel 一些重要的包以及它们的使用方法，我们了解到 Babel 是使用 JavaScript 处理 JavaScript 代码最成熟的技术方案。


Babel 模块

Babylon（ @babel/parser）

Config配置



如果你是从 Taro CLI 的 dist 文件夹看编译后的代码会发现它相当复杂，那是因为代码会再经过 babel 编译为 ES5。

除了 Page 类型之外，小程序还有 Component 类型，所以 Taro 其实还有 createComponent 方法。由于 Component 在小程序里是全局变量，因此我们还得把 import { Component } from '@tarojs/taro' 的 Component 重命名。

接下来，我们可以对比一下编译后的代码，可以发现，编译后的代码中，React 的核心 render 方法 没有了。同时代码里增加了 BaseComponent 和 createComponent ,它们是 Taro 运行时的核心。

### 运行时
createComponent 方法主要做了这样几件事情：

将组件的 state 转换成小程序组件配置对象的 data

将组件的生命周期对应到小程序组件的生命周期

将组件的事件处理函数对应到小程序的事件处理函数

**BaseComponent **大概的 UML 图如下，主要是对 React 的一些核心方法：setState、forceUpdate 等进行了替换和重写，结合前面编译后 render 方法被替换，大家不难猜出：Taro 当前架构只是在开发时遵循了 React 的语法，在代码编译之后实际运行时，和 React 并没有关系。

![图片](https://uploader.shimo.im/f/BOCYPJUF1B8qgoWi.png!thumbnail)

### 而 createComponent 主要作用是调用 Component() 构建页面；对接事件、生命周期等；进行 Diff Data 并调用 setData 方法更新数据。

## 老版本问题

![图片](https://uploader.shimo.im/f/zNvDrJ2KoUgWU9u0.png!thumbnail)



![图片](https://uploader.shimo.im/f/ArCZb0EeHQszXovm.png!thumbnail)

## 新架构 Taro Next 的适配与实现
 

这一次，我们站在浏览器的角度来思考前端的本质：无论开发这是用的是什么框架，React 也好，Vue 也罢，最终代码经过运行之后都是调用了浏览器的那几个 BOM/DOM 的 API ，如：createElement、appendChild、removeChild 等。

 ![图片](https://uploader.shimo.im/f/szevBLZRvIQWLJdu.png!thumbnail)

 

因此，我们创建了 [taro-runtime](https://github.com/NervJS/taro/tree/next/packages/taro-runtime) 的包，然后在这个包中实现了 **一套 高效、精简版的 DOM/BOM API**（下面的 UML 图只是反映了几个主要的类的结构和关系）：

 ![图片](https://uploader.shimo.im/f/1yemN8XEXdQxHpaS.png!thumbnail)

 

然后，我们通过 Webpack 的 [ProvidePlugin](https://webpack.js.org/plugins/provide-plugin/) 插件，注入到小程序的逻辑层。

 ![图片](https://uploader.shimo.im/f/Bcpyz7CEFmIsXwpV.png!thumbnail)

 

这样，在小程序的运行时，就有了 **一套高效、精简版的 DOM/BOM API**。

 

### React 实现
 

在 DOM/BOM 注入之后，理论上来说，Nerv/Preact 就可以直接运行了。但是 React 有点特殊，因为 React-DOM 包含大量浏览器兼容类的代码，导致包太大，而这部分代码我们是不需要的，因此我们需要做一些定制和优化。

 

在 React 16+ ，React 的架构如下：

 ![图片](https://uploader.shimo.im/f/mn1f5yraPC883M8g.png!thumbnail)

 

最上层是 React 的核心部分 react-core ，中间是 react-reconciler，其的职责是维护 VirtualDOM 树，内部实现了 Diff/Fiber 算法，决定什么时候更新、以及要更新什么。

 

而 Renderer 负责具体平台的渲染工作，它会提供宿主组件、处理事件等等。例如 React-DOM 就是一个渲染器，负责 DOM 节点的渲染和 DOM 事件处理。

 

因此，我们实现了 [taro-react](https://github.com/NervJS/taro/tree/next/packages/taro-react) 包，用来连接 react-reconciler 和 taro-runtime 的 BOM/DOM API：

 ![图片](https://uploader.shimo.im/f/A2CGfX6BflIaLnXk.png!thumbnail)

 

具体的实现主要分为两步：

1. **实现 react-reconciler 的 hostConfig 配置，即在 hostConfig 的方法中调用对应的 Taro BOM/DOM 的 API。 **
2. **实现 render 函数（类似于 ReactDOM.render）方法，可以看成是创建 Taro DOM Tree 的容器。**

 ![图片](https://uploader.shimo.im/f/nRk0L5warFAPmzm3.png!thumbnail)

 

经过上面的步骤，React 代码实际上就可以在小程序的运行时正常运行了，并且会生成 Taro DOM Tree，那么偌大的 Taro DOM Tree 怎样更新到页面呢？

 

首先，我们将小程序的所有组件挨个进行**模版化处理**，从而得到小程序组件对应的模版，如下图就是小程序的 view 组件经过模版化处理后的样子：

 ![图片](https://uploader.shimo.im/f/Q3J84JPQTOcdaZyJ.png!thumbnail)

 

然后，我们会：**基于组件的 template，动态 “递归” 渲染整棵树**。

 

具体流程为先去遍历 Taro DOM Tree 根节点的子元素，再根据每个子元素的类型选择对应的模板来渲染子元素，然后在每个模板中我们又会去遍历当前元素的子元素，以此把整个节点树递归遍历出来。

 ![图片](https://uploader.shimo.im/f/BkGQXX75i04lNcKs.png!thumbnail)

 

整个 Taro Next 的 React 实现流程图如下：

 ![图片](https://uploader.shimo.im/f/1oNeqrLQFCE2nSop.png!thumbnail)

 

### Vue 实现
 

别看 React 和 Vue 在开发时区别那么大，其实在实现了 BOM/DOM API 之后，它们之间的区别就很小了。

 

Vue 和 React 最大的区别就在于运行时的 CreateVuePage 方法，这个方法里进行了一些运行时的处理，比如：生命周期的对齐。

 ![图片](https://uploader.shimo.im/f/1ne7kplIEP8eEV59.png!thumbnail)

 

其他的部分，如通过 BOM/DOM 方法构建、修改 DOM Tree 及渲染原理，都是和 React 一致的。


### Kbone
Kbone 内部实现了轻量级的 DOM 和 BOM API，把 DOM 更改的绑定到小程序的视图更改。也就是说，Kbone 并不太关心开发者使用什么框架，只要框架使用的 DOM API 被 Kbone 实现的 DOM API 覆盖到，框架就能通过 Kbone 在小程序运行。Taro Next 也有着同样的思路，但不同的是对 React 的处理。Kbone 通过引入 react-dom 实现渲染，但 react-dom 包含着和合成事件实现和大量浏览器兼容代码。Taro 团队认为这部分代码对小程序平台意义不大，因此和 Remax 一样，通过 react-reconciler 实现了小程序渲染器。

在更新方面，Kbone 以组件为粒度进行更新，每次视图改变小程序 setData 的数据是组件的 DOM 树。而 Remax 和 Taro 更新 setData 的数据则是 DOM 树中已经改变了的的值和它的路径。对比起 Taro 和 Remax，Kbone 的运行时性能会差一些。

另外 Kbone 更为专注于微信小程序开发和 H5 开发，而本节对比的其它三个小程序框架均支持多种平台的小程序开发。

