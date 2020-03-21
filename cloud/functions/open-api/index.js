// 云函数入口文件

const cloud = require('wx-server-sdk')

// 初始化云函数
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
/**
 * 
 * 将 arrayBuffer 转为 buffer 
 * 
*/
function toBuffer(ab) {

  let buf = Buffer.from(ab)
  return buf;
}
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'imgSecCheck': {
      return imgSecCheck(event)
    }
    case 'createQRCode': {
      return createQRCode(event)
    }
    case 'createMiniCode': {
      return createMiniCode(event)
    }
    default: {
      return
    }
  }
}

/**
* 函数imgSecCheck
* 参数 event:{
*    file //上传的文件
*  }
*   
*/

async function imgSecCheck(event) {
  let { file } = event
  console.log('file :', file);
  const result = await cloud.openapi.security.imgSecCheck({
    media: {
      contentType: 'image/png',
      value: toBuffer(file)
    }
  })
  return {
    data: result,
    time: new Date(),
    status: result.errCode || 0,
    message: result.errMsg || ''
  }
}
/**
* 函数imgSecCheck
* 参数 event:{
*    path //路径
*    width // 宽度
*  }
*   
*/

async function createQRCode(event) {
  let { path = '', width = 300 } = event

  try {
    const { errCode, errMsg, buffer } = await cloud.openapi.wxacode.createQRCode({
      path,
      width
    })
  
    let base64Main = buffer.toString('base64')
    
    return {
      data: {
        base64Main
      },
      time: new Date(),
      status: errCode || 0,
      message: errMsg || ''
    }
    
  } catch (error) {
    return {
      data: error,
      time: new Date(),
      status: -30000,
      message: '生成失败'
    }
  }
}
/**
* 函数imgSecCheck
* 参数 event:{
*    path //路径
*    width // 宽度
*  }
*   
*/

async function createMiniCode(event) {
  let { path = '', width = 300 } = event

  try {
    const { errCode, errMsg, buffer } = await cloud.openapi.wxacode.get({
      path,
      width
    })
  
    let base64Main = buffer.toString('base64')
    
    return {
      data: {
        base64Main
      },
      time: new Date(),
      status: errCode || 0,
      message: errMsg || ''
    }
    
  } catch (error) {
    return {
      data: error,
      time: new Date(),
      status: -30000,
      message: '生成失败'
    }
  }
}

