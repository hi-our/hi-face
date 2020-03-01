var AipImageProcessClient = require('./baidu-nodejs-sdk').imageProcess;
const config = require('./config')
const status = require('./status')


// 设置APPID/AK/SK
var APP_ID = config.APP_ID;
var API_KEY = config.API_KEY;
var SECRET_KEY = config.SECRET_KEY;

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipImageProcessClient(APP_ID, API_KEY, SECRET_KEY);

// 接口文档 https://cloud.baidu.com/doc/IMAGEPROCESS/s/xk3bclo77
const styleTrans = (event, context) => {
  const { base64Main = '', type } = event
  return client.styleTrans(base64Main, type).then(res => {
    console.log('res :', res);
    const { error_code = '', error_msg = '', image } = res

    if (error_code) {
      // 请求异常返回，打印异常信息
      console.log('code :', error_code);

      return ({
        data: {},
        time: new Date(),
        status: error_code,
        message: status.TRANS_CODE[error_msg] || '图片解析失败'
      })
    }
    // 请求异常返回，打印异常信息
    return ({
      data: {
        base64Main: image
      },
      time: new Date(),
      status: 0,
      message: ''
    })
  }).catch(error => {
    console.log('error :', error);
  })
}


// 接口文档 https://ai.baidu.com/ai-doc/IMAGEPROCESS/Mk4i6olx5
const selfieAnime = (event, context) => {
  const { base64Main = '', type } = event
  return client.selfieAnime(base64Main, type).then(res => {
    console.log('res :', res);
    const { error_code = '', error_msg = '', image } = res

    if (error_code) {
      // 请求异常返回，打印异常信息
      console.log('code :', error_code);

      return ({
        data: {},
        time: new Date(),
        status: error_code,
        message: status.TRANS_CODE[error_msg] || '图片解析失败'
      })
    }

    // 请求异常返回，打印异常信息
    return ({
      data: {
        base64Main: image
      },
      time: new Date(),
      status: 0,
      message: ''
    })

  }).catch(error => {
    console.log('error :', error);
  })
}

// 云函数入口函数
exports.main = async (event, context) => {

  if (event.type === 'anime') return selfieAnime(event, context)

  return styleTrans(event, context)
}