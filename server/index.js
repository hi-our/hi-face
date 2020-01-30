const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const tencentcloud = require('tencentcloud-sdk-nodejs');
const loadEnv = require('./load-env')

const app = express();
const port = process.env.PORT || 5000;

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
// API calls
app.get('/api/face-detection', async (req, res) => {
  console.log('1 :', 1);

  const { baseData = '' } = req.query
  console.log('src :', baseData);


  let faceReq = new models.DetectFaceRequest();
  let filters = {
    Url: baseData
  };

  console.log('filters :', filters);
  // 传入json参数
  faceReq.from_json_string(JSON.stringify(filters));

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
