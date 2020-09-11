import {Color} from "@tarojs/taro";
import CanvasContext = Taro.CanvasContext;

function compareVersion(v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

function isWeapp() {
  return process.env.TARO_ENV === 'weapp'
}

//////////////////////////////////////////////////////////////////////////////////
//////// 微信小程序自1.9.90起废除若干个CanvasContext的函数，改为属性，以下为兼容代码
//////////////////////////////////////////////////////////////////////////////////


function _easyCanvasContextBase(systemInfo: Taro.getSystemInfoSync.Return, lowCallback: () => void, highCallback: () => void, targetVersion: string = "1.9.90") {
  if (isWeapp() && compareVersion(systemInfo.SDKVersion, targetVersion) >= 0) {
    highCallback()
  } else {
    lowCallback()
  }
}
/**
 *
 * 基础库 1.9.90 开始支持，低版本需做兼容处理。填充颜色。用法同 CanvasContext.setFillStyle()。
 * @param systemInfo
 * @param canvasContext
 * @param color
 */
function easySetStrokeStyle(systemInfo: Taro.getSystemInfoSync.Return, canvasContext: CanvasContext, color: string | Color) {
  _easyCanvasContextBase(systemInfo, () => {
    canvasContext.setStrokeStyle(color);
    console.log("???");
  }, () => {
    if (typeof color === "string") {
      canvasContext.strokeStyle = color
    }
  });
}

function easySetLineWidth(systemInfo: Taro.getSystemInfoSync.Return, canvasContext: CanvasContext, lineWidth: number) {
  _easyCanvasContextBase(systemInfo, () => {
    canvasContext.setLineWidth(lineWidth)
  }, () => {
    canvasContext.lineWidth = lineWidth
  })
}

function easySetFillStyle(systemInfo: Taro.getSystemInfoSync.Return, canvasContext: CanvasContext, color: string | Color) {
  _easyCanvasContextBase(systemInfo, () => {
    canvasContext.setFillStyle(color)
  }, () => {
    if (typeof color === "string") {
      canvasContext.fillStyle = color
    }
  })
}


/*
 * @param x {Object} 对象1
 * @param y {Object} 对象2
 * @return  {Boolean} true 为相等，false 为不等
 */
const deepEqual = function (x, y) {
  // 指向同一内存时
  if (x === y) {
    return true;
  }
  else if ((typeof x == 'object' && x != null) && (typeof y == 'object' && y != null)) {
    if (Object.keys(x).length != Object.keys(y).length)
      return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop]))
          return false;
      }
      else
        return false;
    }

    return true;
  }
  else
    return false;
}


export {
  deepEqual,
  easySetStrokeStyle,
  easySetLineWidth,
  easySetFillStyle
}
