const tencentcloud = require('./tencentcloud-sdk-nodejs')
const config = require('./config')
const status = require('./status')

// 腾讯云的id和key
let secretId = config.SecretId || ''
let secretKey = config.SecretKey || ''


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
          message: 'AnalyzeFace ' + + status.FACE_CODE[code] + Image || code || '图片解析失败'
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

module.exports = {
  analyzeFace
}