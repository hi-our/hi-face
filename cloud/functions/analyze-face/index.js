const tcb = require('tcb-admin-node')
const config = require('./config')
const reqFace = require('./req-iai-face')
const reqWxOpenapi = require('./req-wx-openapi')

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

// 腾讯云的id和key
let secretId = config.SecretId || ''
let secretKey = config.SecretKey || ''
let env = config.env || ''

tcb.init({
  secretId,
  secretKey,
  env
})

const analyzeFace = reqFace.analyzeFace

const imgSecCheck = reqWxOpenapi.imgSecCheck

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
    return Promise.allSettled([imgSecCheck(Buffer.from(Image, 'base64')), analyzeFace(Image)]).then((results) => {
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