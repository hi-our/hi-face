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

