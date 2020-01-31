import Taro from '@tarojs/taro'
import { drawCoverImage, fillText } from './canvas';
import { getSystemInfo } from 'utils/common'

const  HatImg = 'http://n1image.hjfile.cn/res7/2020/01/30/45e621c4a9acb9f928a1f47e038202ec.png'
/**
 * 根据我当前的圣诞帽元素进行一些偏移(我的图片大小是200*130)， 圣诞帽可佩戴部分的中心 (62,60)  这里需要微调
 * 图片可佩戴部分是 0.6 倍图片宽度
 * @param {*} x
 * @param {*} y
 */
const translateHat = (faceWidth, x, y) => {
  const picSize = { width: faceWidth / 0.6, height: (faceWidth * 0.65) / 0.6 };
  return {
    ...picSize,
    x: x - (62 * picSize.width) / 200,
    y: y - (60 * picSize.height) / 130,
  };
};

/**
 * 获取图片
 * @param {*} src 图片地址
 * @param {*} callback
 */
const getImg = async (src) => {
  try {
    const res = await Taro.getImageInfo({
      src,
    })
    return res.path
    
  } catch (error) {
    console.log('error :', error);
    
  }
}

/**
 * 绘制帽子
 * @param {*} ctx 画布实例
 * @param {{}} config 配置
 */
const drawHat = async (ctx, config) => {
  const { headPos, angle, faceWidth } = config;
  const img = await getImg(HatImg);
  ctx.translate(headPos.x, headPos.y);
  // 旋转画布到特定角度
  ctx.rotate(angle);
  // 偏移图片，使帽子中心刚好在原点
  const { x, y, width, height } = translateHat(faceWidth, 0, 0);
  console.log('x, y, width, height :', 0, 0, 30, 30);
  // 我的圣诞帽子实际佩戴部分长度只有0.75倍整个图片长度
  ctx.drawImage(img, x, y, width, height);

  // ctx.draw()
  // 还原画布绘制状态，如偏移
  // ctx.restore();
}

/**
 * 绘制主流程
 * @param {*} canvas
 * @param {*} options
 */
export const drawing = async (canvas, options) => {
  const { info, width = 200, height = 200, imgSrc = 'images/default.jpg' } = options;
  const ctx = Taro.createCanvasContext('canvasHat')

  // 重置
  ctx.clearRect(0, 0, width, height)
  // // 先把图片绘制上去
  const imgSrc2 = await getImg(imgSrc);
  
  ctx.drawImage(imgSrc2, 0, 0, width, height)
  if (info) {
    for (let i = 0, len = info.length; i < len; i++) {
      await drawHat(ctx, info[i]);
    }
  }
  // 循环把帽子画到对应的点上
  ctx.draw()
}
