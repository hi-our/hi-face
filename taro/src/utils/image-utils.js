import Taro from '@tarojs/taro'
import { getSystemInfo, promisify } from './common'

const fsm = Taro.getFileSystemManager()
const FILE_BASE_NAME = 'tmp_base64src'

const isH5Page = process.env.TARO_ENV === 'h5'

const { screenWidth } = getSystemInfo()

/**
   * 单位转换
   * @param value
   * @private
   */
export const getRealRpx = (value) => {
  return value * 750 / screenWidth;
}

export const getShowRpx = (value) => {
  if (isH5Page) return Taro.pxTransform(value / 2)

  return value + 'rpx'
}

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
  console.log('url :>> ', url)
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

  // 必须设置，否则canvas中的内容无法转换为base64
  img.setAttribute('crossOrigin', 'Anonymous')

  img.src = url

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

export const saveImageToPhotosAlbum = (tempFilePath) => {

  if (isH5Page) {
    downloadImgByBase64(tempFilePath)
    return
  }

  Taro.saveImageToPhotosAlbum({
    filePath: tempFilePath,
    success: res2 => {
      Taro.showToast({
        title: '图片保存成功'
      })
      console.log('保存成功 :', res2);
    },
    fail(e) {
      Taro.showToast({
        title: '图片未保存成功'
      })
      console.log('图片未保存成功:' + e);
    }
  })
}

export const onDownloadFile = async (fileID) => {

  let { tempFilePath } = await Taro.cloud.downloadFile({
    fileID,
  })

  return tempFilePath
}

export const onUploadFile = async (tempFilePath, prefix = 'temp') => {
  try {

    let uploadParams = {
      cloudPath: `${prefix}/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.jpg`, // 随机图片名
      filePath: tempFilePath,
    }

    const { fileID } = await Taro.cloud.uploadFile(uploadParams)

    return fileID

  } catch (error) {
    console.log('error :', error)
    return ''
  }

}