import Taro from '@tarojs/taro'
import promisify from './promisify';

const fsm = Taro.getFileSystemManager()
const FILE_BASE_NAME = 'tmp_base64src'

const isH5Page = process.env.TARO_ENV === 'h5'

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


export const base64src = async (base64data) => {
  const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
  if (!format) {
    return (new Error('ERROR_BASE64SRC_PARSE'));
  }
  const filePath = `${Taro.env.USER_DATA_PATH}/${FILE_BASE_NAME}-${Date.now()}.${format}`;
  const buffer = Taro.base64ToArrayBuffer(bodyData);
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


// 这个方法可以简化？
export const downloadImgByBase64 = (url) => {
  var img = new Image()
  img.onload = function () {
    var canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    var ctx = canvas.getContext('2d')
    // 将img中的内容画到画布上
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    // 将画布内容转换为base64
    var base64 = canvas.toDataURL()
    // 创建a链接
    var a = document.createElement('a')
    a.href = base64
    a.download = ''
    // 触发a链接点击事件，浏览器开始下载文件
    a.click()
  }
  img.src = url
  // 必须设置，否则canvas中的内容无法转换为base64
  img.setAttribute('crossOrigin', 'Anonymous')

}

const getH5Image = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = src
    image.id = `taro_cropper_${Date.now()}`;
    image.style.display = 'none';
    document.body.append(image);
    image.onload = () => resolve(image)
    image.onerror = () => reject(image)
  })
}

/**
 * 获取图片
 * @param {*} src 图片地址
 * @param {*} callback
 */
export const getImg = async (src) => {
  if (isH5Page) {
    let image = await getH5Image(src)
    return image
  }

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
export const drawHat = async (ctx, config) => {
  const { headPos, angle, faceWidth } = config;
  let HatImgTest = require('../images/hat.png')

  const img = isH5Page ? await getImg(HatImgTest) : HatImgTest

  ctx.save();

  console.log('headPos.x, headPos.y :', headPos.X, headPos.Y);
  ctx.translate(headPos.X, headPos.Y);
  // 旋转画布到特定角度
  ctx.rotate(angle);
  // 偏移图片，使帽子中心刚好在原点
  console.log('translateHat(faceWidth, 0, 0) :', translateHat(faceWidth, 0, 0));
  const { x, y, width, height } = translateHat(faceWidth, 0, 0);
  console.log('x, y, width, height :', x, y, width, height);
  // 我的圣诞帽子实际佩戴部分长度只有0.75倍整个图片长度
  ctx.drawImage(img, x, y, width, height);
  
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
  console.log('123 :', 123);
  console.log('canvas :', canvas);
  let ctx = null
  try {
    ctx = Taro.createCanvasContext('canvasHat')
    ctx = canvas.getContext('2d') //Taro.createCanvasContext('canvasHat')
    console.log('ctx :', ctx);
    
  } catch (error) {
    console.log('error :', error);
  }

  if (!ctx) return 

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
