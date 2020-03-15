const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const tencentcloud = require('./node-libs/tencentcloud-sdk-nodejs');
const loadEnv = require('./load-env')

const app = express();
const port = process.env.PORT || 8768;

const FACE_CODE = {
  'FailedOperation.ConflictOperation': '操作冲突，请勿同时操作相同的Person。',
  'FailedOperation.DuplicatedGroupDescription': '同一人员库中自定义描述字段不可重复。',
  'FailedOperation.GroupInDeletedState': '当前组正处于删除状态，请等待。',
  'FailedOperation.GroupPersonMapExist': '组中已包含对应的人员Id。',
  'FailedOperation.GroupPersonMapNotExist': '组中不包含对应的人员Id。',
  'FailedOperation.ImageDecodeFailed': '图片解码失败。',
  'FailedOperation.ImageDownloadError': '图片下载错误。',
  'FailedOperation.ImageFacedetectFailed': '人脸检测失败。',
  'FailedOperation.ImageResolutionExceed': '图片分辨率过大。',
  'FailedOperation.ImageSizeExceed': 'base64编码后的图片数据大小不超过5M。',
  'FailedOperation.RequestTimeout': '后端服务超时。',
  'FailedOperation.SearchFacesExceed': '检索人脸个数超过限制。',
  'FailedOperation.ServerError': '算法服务异常，请重试。',
  'InternalError': '内部错误。',
  'InvalidParameter.InvalidParameter': '参数不合法。',
  'InvalidParameterValue.AccountFaceNumExceed': '账号脸数量超出限制。',
  'InvalidParameterValue.DeleteFaceNumExceed': '删除人脸数量超出限制。每个人员至少需要包含一张人脸。',
  'InvalidParameterValue.FaceModelVersionIllegal': '算法模型版本不合法。',
  'InvalidParameterValue.GroupExDescriptionsExceed': '人员库自定义描述字段数组长度超过限制。最多可以创建5个。',
  'InvalidParameterValue.GroupExDescriptionsNameIdentical': '人员库自定义描述字段名称不可重复。',
  'InvalidParameterValue.GroupExDescriptionsNameIllegal': '人员库自定义描述字段名称包含非法字符。人员库自定义描述字段名称只支持中英文、-、_、数字。',
  'InvalidParameterValue.GroupExDescriptionsNameTooLong': '人员库自定义描述字段名称长度超出限制。',
  'InvalidParameterValue.GroupFaceNumExceed': '人员库人脸数量超出限制。',
  'InvalidParameterValue.GroupIdAlreadyExist': '人员库ID已经存在。人员库ID不可重复。',
  'InvalidParameterValue.GroupIdIllegal': '人员库ID包含非法字符。人员库ID只支持英文、数字、-%@#& _。',
  'InvalidParameterValue.GroupIdNotExist': '人员库ID不存在。',
  'InvalidParameterValue.GroupIdTooLong': '人员库ID超出长度限制。',
  'InvalidParameterValue.GroupIdsExceed': '传入的人员库列表超过限制。',
  'InvalidParameterValue.GroupNameAlreadyExist': '人员库名称已经存在。人员库名称不可重复。',
  'InvalidParameterValue.GroupNameIllegal': '人员库名称包含非法字符。人员库名称只支持中英文、-、_、数字。',
  'InvalidParameterValue.GroupNameTooLong': '人员库名称超出长度限制。',
  'InvalidParameterValue.GroupNumExceed': '人员库数量超出限制。如需增加，请联系我们。',
  'InvalidParameterValue.GroupNumPerPersonExceed': '人员库数量超出限制。单个人员最多可被添加至100个人员库。',
  'InvalidParameterValue.GroupTagIllegal': '人员库备注包含非法字符。人员库备注只支持中英文、-、_、数字。',
  'InvalidParameterValue.GroupTagTooLong': '人员库备注超出长度限制。',
  'InvalidParameterValue.ImageEmpty': '图片为空。',
  'InvalidParameterValue.LimitExceed': '返回数量超出限制。',
  'InvalidParameterValue.NoFaceInGroups': '指定分组中没有人脸。',
  'InvalidParameterValue.NoFaceInPhoto': '图片中没有人脸。',
  'InvalidParameterValue.OffsetExceed': '起始序号过大。请检查需要请求的数组长度。',
  'InvalidParameterValue.PersonExDescriptionInfosExceed': '人员自定义描述字段数组长度超过限制。最多5个。',
  'InvalidParameterValue.PersonExDescriptionsNameIdentical': '人员自定义描述字段名称不可重复。',
  'InvalidParameterValue.PersonExDescriptionsNameIllegal': '人员自定义描述字段名称包含非法字符。人员自定义描述字段名称只支持中英文、-、_、数字。',
  'InvalidParameterValue.PersonExDescriptionsNameTooLong': '人员自定义描述字段名称长度超出限制。',
  'InvalidParameterValue.PersonExistInGroup': '组中已包含对应的人员Id。',
  'InvalidParameterValue.PersonFaceNumExceed': '人员人脸数量超出限制。单个人员最多可以包含五张人脸。',
  'InvalidParameterValue.PersonGenderIllegal': '人员性别设置出错。0代表未填写，1代表男性，2代表女性。',
  'InvalidParameterValue.PersonIdAlreadyExist': '人员ID已经存在。人员ID不可重复。',
  'InvalidParameterValue.PersonIdIllegal': '人员ID包含非法字符。人员ID只支持英文、数字、-%@#& _。',
  'InvalidParameterValue.PersonIdNotExist': '人员ID不存在。',
  'InvalidParameterValue.PersonIdTooLong': '人员ID超出长度限制。',
  'InvalidParameterValue.PersonNameIllegal': '人员名称包含非法字符。人员名称只支持中英文、-、_、数字。',
  'InvalidParameterValue.PersonNameTooLong': '人员名称超出长度限制。',
  'InvalidParameterValue.SearchPersonsExceed': '搜索的人员数目超过限制。',
  'InvalidParameterValue.UploadFaceNumExceed': '一次最多上传四张人脸。',
  'InvalidParameterValue.UrlIllegal': 'URL格式不合法。',
  'LimitExceeded.ErrorFaceNumExceed': '人脸个数超过限制。',
  'MissingParameter.ErrorParameterEmpty': '必选参数为空。',
  'ResourceUnavailable.Delivering': '资源正在发货中。',
  'ResourceUnavailable.Freeze': '帐号已被冻结。',
  'ResourceUnavailable.InArrears': '帐号已欠费。',
  'ResourceUnavailable.NotExist': '计费状态未知，请确认是否已在控制台开通服务。',
  'ResourceUnavailable.Recover': '资源已被回收。',
  'ResourceUnavailable.StopUsing': '帐号已停服。',
  'ResourceUnavailable.UnknownStatus': '计费状态未知。',
  'ResourcesSoldOut.ChargeStatusException': '计费状态异常。',
  'UnsupportedOperation.UnknowMethod': '未知方法名。',
}

/* 
根目录创建.env文件
#腾讯云的id和key
SecretId=abc
SecretKey=def
*/
loadEnv()

const { SecretId = '', SecretKey = '' } = process.env

if (!SecretId || !SecretKey) {
  console.log('请设置腾讯云的安全key https://console.cloud.tencent.com/developer/security')
}

app.use(bodyParser.json({ "limit": "5000kb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const IaIClient = tencentcloud.iai.v20180301.Client;
const models = tencentcloud.iai.v20180301.Models;

const Credential = tencentcloud.common_tc3.Credential;
const ClientProfile = tencentcloud.common_tc3.ClientProfile;
const HttpProfile = tencentcloud.common_tc3.HttpProfile;

let httpProfile = new HttpProfile();
httpProfile.endpoint = "iai.tencentcloudapi.com";
let clientProfile = new ClientProfile();

/*
推荐使用 V3 鉴权。当内容超过 1M 时，必须使用 V3 签名鉴权。https://cloud.tencent.com/document/product/1093/39964
*/
clientProfile.signMethod = "TC3-HMAC-SHA256";
// clientProfile.signMethod = 'HmacSHA256';
clientProfile.httpProfile = httpProfile;


// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey
let cred = new Credential(SecretId, SecretKey);

// 实例化要请求产品(以cvm为例)的client对象
let client = new IaIClient(cred, "ap-shanghai", clientProfile);


// API calls
app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

/* 
五官分析
https://cloud.tencent.com/document/product/867/32779

Action	是	String	公共参数，本接口取值：AnalyzeFace。
Version	是	String	公共参数，本接口取值：2018-03-01。
Region	否	String	公共参数，本接口不需要传递此参数。
Mode	否	Integer	检测模式。0 为检测所有出现的人脸， 1 为检测面积最大的人脸。默认为 0。最多返回 10 张人脸的五官定位（人脸关键点）具体信息。
Image	否	String	图片 base64 数据，base64 编码后大小不可超过5M。
支持PNG、JPG、JPEG、BMP，不支持 GIF 图片。
Url	否	String	图片的 Url 。对应图片 base64 编码后大小不可超过5M。
Url、Image必须提供一个，如果都提供，只使用 Url。
图片存储于腾讯云的Url可保障更高下载速度和稳定性，建议图片存储于腾讯云。
非腾讯云存储的Url速度和稳定性可能受一定影响。
支持PNG、JPG、JPEG、BMP，不支持 GIF 图片。
FaceModelVersion	否	String	人脸识别服务所用的算法模型版本。目前入参支持 “2.0”和“3.0“ 两个输入。
默认为"2.0"。
不同算法模型版本对应的人脸识别算法不同，新版本的整体效果会优于旧版本，建议使用最新版本。

*/
// API calls
app.post('/api/analyze-face', async (req, res) => {

  let faceReq = new models.DetectFaceRequest();
  let queryBody = Object.assign({}, req.body || {}, { signMethod: 'TC3-HMAC-SHA256'})
  // console.log('queryBody :', queryBody);
  let query_string = JSON.stringify(queryBody)
  // 传入json参数
  faceReq.from_json_string(query_string);

  // console.log('faceReq :', faceReq);

  console.log('post /api/analyze-face');
  // TC3-HMAC-SHA256
  // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
  client.AnalyzeFace(faceReq, function (error, response) {
    // 请求异常返回，打印异常信息
    if (error) {
      const { code = '' } = error
      console.log('code :', code);
      
      res.send({
        data: {},
        time: new Date(),
        status: code || -10086,
        message: FACE_CODE[code] || '图片解析失败' + code
      })
      return;
    }

    console.log('AnalyzeFace response :', response)
    // 请求正常返回，打印response对象
    res.send({
      data: response,
      time: new Date(),
      status: 0,
      message: ''
    })
  });

});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

if (process.env.NODE_ENV) {
  console.log('(process.env.NODE_ENV :', process.env.NODE_ENV);
}

if (process.env.NODE_ENV === 'production') {
  console.log('编译正式环境的效果 :');
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'taro/dist-h5')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'taro/dist-h5', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
