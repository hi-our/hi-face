import Taro from '@tarojs/taro'
import { drawCoverImage, fillText } from './canvas';
import { getSystemInfo } from 'utils/common'
import { HAT_IMG } from 'constants/image-test'
import promisify from './promisify';

import FaceImageTest from '../images/one_face.jpeg'
import HatImgTest from '../images/hat.png'

const fsm = Taro.getFileSystemManager();
const FILE_BASE_NAME = 'tmp_base64src';

/* 
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


const base64src = async (base64data) => {
  const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
  if (!format) {
    return (new Error('ERROR_BASE64SRC_PARSE'));
  }
  const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
  const buffer = wx.base64ToArrayBuffer(bodyData);
  try {
    await fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
    });
    return filePath
    
  } catch (error) {
    console.log('error :', error);
  }
};

export const getBase64Main = (fullSrc) => {
  return fullSrc.split(',')[1]
}

export const srcToBase64Main = async (src) => {
  try {
    const readFile = promisify(fsm.readFile)
    const { data } = await readFile({
      filePath: src,
      encoding: 'base64',
    })

    return data
    
  } catch (error) {
    
    console.log('error :', error);
  }
}


// 文件管理
export const fsmReadFile = promisify(fsm.readFile)

/**
 * 获取图片
 * @param {*} src 图片地址
 * @param {*} callback
 */
export const getImg = async (src) => {
  console.log('getImg src :', src);
  if (src.includes(';base64,')) {
    return await base64src(src)
  }

  try {
    const res = await Taro.getImageInfo({
      src,
    })
    return res.path
    
  } catch (error) {
    console.log('error :', error);
    throw error
    
  }
}

/**
 * 绘制帽子
 * @param {*} ctx 画布实例
 * @param {{}} config 配置
 */
const drawHat = async (ctx, config) => {
  const { headPos, angle, faceWidth } = config;
  const img = await getImg(HatImgTest);
  console.log('img :', img);

  ctx.save();

  ctx.translate(headPos.x, headPos.y);
  // 旋转画布到特定角度
  ctx.rotate(angle);
  // 偏移图片，使帽子中心刚好在原点
  const { x, y, width, height } = translateHat(faceWidth, 0, 0);
  // console.log('x, y, width, height :', 0, 0, 30, 30);
  // 我的圣诞帽子实际佩戴部分长度只有0.75倍整个图片长度
  ctx.drawImage(img, x, y, width, height);

  // ctx.draw()
  // 还原画布绘制状态，如偏移
  ctx.restore()
  
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

  try {
    // // 先把图片绘制上去
    const imgSrcTransform = await getImg(imgSrc);
    console.log('imgSrcTransform :', imgSrcTransform);
    ctx.drawImage(imgSrcTransform, 0, 0, width, height)
    
  } catch (error) {
    console.log('imgSrcTransform error :', error);
  }

  // 把帽子画到对应的点上
  if (info) {
    drawHat(ctx, info[0]);
  }

  // TODO 加了以后显示效果才对
  // fillText(ctx, ' ', 55, 233, false, 12, '#687583')
  // TODO 加了以后显示效果才对
  setTimeout(() => {
    ctx.draw()
  }, 500)
}
