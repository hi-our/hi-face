const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const tencentcloud = require('tencentcloud-sdk-nodejs');
const loadEnv = require('./load-env')

const app = express();
const port = process.env.PORT || 8768;

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const IaIClient = tencentcloud.iai.v20180301.Client;
const models = tencentcloud.iai.v20180301.Models;

const Credential = tencentcloud.common.Credential;

// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey
let cred = new Credential(SecretId, SecretKey);

// 实例化要请求产品(以cvm为例)的client对象
let client = new IaIClient(cred, "ap-shanghai");


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
app.get('/api/analyze-face', async (req, res) => {

  let faceReq = new models.DetectFaceRequest();
  // 传入json参数
  faceReq.from_json_string(JSON.stringify(req.query || {}));

  // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
  console.log('client :', client);
  client.AnalyzeFace(faceReq, function (err, response) {
    // 请求异常返回，打印异常信息
    if (err) {
      console.log('err', err);
      return;
    }
    // 请求正常返回，打印response对象
    console.log(response.to_json_string());
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

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
