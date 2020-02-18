
const cloud = require('wx-server-sdk')

// 初始化云函数
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
* 函数imgSecCheck
* 参数 event:{
*    file //上传的文件
*  }
*   
*/

async function imgSecCheck(imageBuffer) {

  try {
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: imageBuffer
      }
    })
    return {
      data: {},
      time: new Date(),
      status: result.errCode || 0,
      message: result.errMsg || ''
    }

  } catch (error) {
    return {
      data: {},
      time: new Date(),
      status: error.errCode || 0,
      message: error.errMsg || ''
    }
  }
}

module.exports = {
  imgSecCheck
}