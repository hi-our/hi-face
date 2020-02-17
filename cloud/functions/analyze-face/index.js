const tencentcloud = require('./tencentcloud-sdk-nodejs')
const tcb = require('tcb-admin-node')
const config = require('./config')

const cloud = require('wx-server-sdk')

// 初始化云函数
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

if (typeof Promise.allSettled !== "function") {
  Promise.allSettled = function (promises) {
    return new Promise(function (resolve, reject) {
      if (!Array.isArray(promises)) {
        return reject(
          new TypeError("arguments must be an array")
        );
      }
      var resolvedCounter = 0;
      var promiseNum = promises.length;
      var resolvedValues = new Array(promiseNum);
      for (var i = 0; i < promiseNum; i++) {
        (function (i) {
          Promise.resolve(promises[i]).then(
            function (value) {
              resolvedCounter++;
              resolvedValues[i] = value;
              if (resolvedCounter == promiseNum) {
                return resolve(resolvedValues);
              }
            },
            function (reason) {
              resolvedCounter++;
              resolvedValues[i] = reason;
              if (resolvedCounter == promiseNum) {
                return reject(reason);
              }
            }
          );
        })(i);
      }
    });
  };
}

const status = require('./status')

// 腾讯云的id和key
let secretId = config.SecretId || ''
let secretKey = config.SecretKey || ''
let env = config.env || ''

tcb.init({
  secretId,
  secretKey,
  env
})

const IaIClient = tencentcloud.iai.v20180301.Client;
const models = tencentcloud.iai.v20180301.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

let httpProfile = new HttpProfile();
httpProfile.endpoint = "iai.tencentcloudapi.com";
let clientProfile = new ClientProfile();

// /*
// 推荐使用 V3 鉴权。当内容超过 1M 时，必须使用 V3 签名鉴权。https://cloud.tencent.com/document/product/1093/39964
// */
clientProfile.signMethod = "TC3-HMAC-SHA256";
clientProfile.httpProfile = httpProfile;

// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey
let cred = new Credential(secretId, secretKey);

// 实例化要请求产品(以cvm为例)的client对象
let client = new IaIClient(cred, "ap-shanghai", clientProfile);

const analyzeFace = (Image) => {
  let faceReq = new models.DetectFaceRequest()

  let query_string = JSON.stringify({
    Image
  })
  // 传入json参数
  faceReq.from_json_string(query_string);

  return new Promise((resolve, reject) => {
    // TC3-HMAC-SHA256
    // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
    client.AnalyzeFace(faceReq, function (error, response) {
      // 请求异常返回，打印异常信息
      if (error) {
        const { code = '' } = error
        console.log('code :', code);

        resolve({
          data: {},
          time: new Date(),
          status: -10086,
          message: status.FACE_CODE[code] || '图片解析失败'
        })
        return
      }
      console.log('AnalyzeFace response :', response)
      // 请求正常返回，打印response对象
      resolve({
        data: response,
        time: new Date(),
        status: 0,
        message: ''
      })
    })
  });
}

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

function toBuffer(ab) {

  let buf = Buffer.from(ab)
  return buf;
}

exports.main = async (event) => {
  const { fileID = '', base64Main = '' } = event

  let Image = ''


  if (fileID) {
    let { fileContent } = await tcb.downloadFile({
      fileID
    })

    Image = fileContent.toString('base64')

    return Promise.allSettled([imgSecCheck(fileContent), analyzeFace(Image)]).then((results) => {
      let checkResult = results[0]
      let faceResult = results[1]
      if (checkResult.status) {
        return checkResult
      }

      return faceResult
    }).catch(error => {
      console.log('error :', error);
      
    })
  } else if (base64Main) {
    Image = base64Main
    return Promise.allSettled([imgSecCheck(new Buffer(Image, 'base64')), analyzeFace(Image)]).then((results) => {
      let checkResult = results[0]
      let faceResult = results[1]
      console.log('checkResult :', checkResult);
      if (checkResult.status) {
        return checkResult
      }

      return faceResult
    }).catch(error => {
      console.log('error :', error);

    })
  }
  
  let errorString = '请设置 fileID或base64Main'
  console.log(errorString)
  return {
    data: {},
    time: new Date(),
    status: -10086,
    message: errorString
  }

}