require('./promise-allSettled')

const extCi = require("@cloudbase/extension-ci");
const tcb = require('tcb-admin-node')
const axios = require('axios')
const detectFace = require('./req-iai-face').detectFace

let env = process.env.TCB_ENV === 'local' ? 'development-v9y2f' : process.env.TCB_ENV

tcb.init({
  env
})
tcb.registerExtension(extCi)


const getBase64 = async (fileID) => {
  let { fileContent } = await tcb.downloadFile({
    fileID
  })

  return fileContent.toString('base64')
}

const getImageUrl = async (fileID) => {
  const { fileList } = await tcb.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}


exports.main = async (event) => {
  const { fileID = '', width = 600, height = 600 } = event

  if (!fileID) {
    let errorString = '请设置 fileID'
    console.log(errorString)
    return {
      data: {},
      time: new Date(),
      status: -10086,
      message: errorString
    }
  }

  try {
    let originImageUrl = await getImageUrl(fileID)
    let rule = `imageMogr2/thumbnail/!${width}x${height}r|imageMogr2/scrop/${width}x${height}/`
    console.log('rule :', rule);

    let cutImageUrl = originImageUrl + '?' + rule
    console.log('cutImageUrl :', cutImageUrl);
    let {
      fileContent,
      base64Main
    } = await axios.get(cutImageUrl, {
      responseType: 'arraybuffer'
    })
    .then(response => {
      let buffer1 = new Buffer(response.data, 'binary')
      return {
        fileContent: buffer1,
        base64Main: buffer1.toString('base64')
      }
    })

    let imgID = fileID.replace('cloud://', '')
    let index = imgID.indexOf('/')
    let cloudPath = imgID.substr(index)

    console.log('fileContent :', fileContent);

    let facePath = 'detect-face'

    return Promise.allSettled([
      tcb.callFunction({
        name: 'image-safe-check',
        data: {
          fileID: fileID
        }
      }),
      detectFace(base64Main),
      tcb.uploadFile({
        cloudPath: facePath + cloudPath,
        fileContent: fileContent
      })
    ]).then((results) => {
      let checkResult = results[0]
      let faceResult = results[1]
      let fileReult = results[2]

      console.log('fileReult :', fileReult);

      if (checkResult.result.status) {

        return checkResult.result
      }

      return {
        ...faceResult,
        data: {
          ...faceResult.data,
          faceFileID: fileReult.fileID,
          faceImageUrl: cutImageUrl
        }
      }
    })






    console.log('arrayBuffer :', arrayBuffer);

  } catch (error) {
    console.log('error :', error);
    return {
      data: {},
      time: new Date(),
      status: -10087,
      message: JSON.stringify(error)
    }
  }
  
  // let imgID = fileID.replace('cloud://', '')
  // let index = imgID.indexOf('/')
  // let cloudPath = imgID.substr(index)
  // let cloudEnvPath = imgID.substr(0, index)

  // let facePath1 = '/face-recognition1'  
  // const opts = {
  //   rules: [
  //     {
  //       // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
  //       fileid: facePath1 + cloudPath,
  //       rule: "imageMogr2/scrop/800x800" // 处理样式参数，与下载时处理图像在url拼接的参数一致
  //     }
  //   ]
  // }


  // await tcb.invokeExtension("CloudInfinite", {
  //   action: "ImageProcess",
  //   cloudPath: cloudPath, // 存储图像的绝对路径，与tcb.uploadFile中一致
  //   // fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
  //   operations: opts
  // });

  // let faceFileID = cloudEnvPath + facePath1 + cloudPath

  // // const base64 = await getBase64(faceFileID)
  // const imageUrl = await getImageUrl(faceFileID)

  // return Promise.allSettled([
  //   tcb.callFunction({
  //     name: 'image-safe-check',
  //     data: {
  //       fileID: faceFileID
  //     }
  //   }), 
  //   detectFace(imageUrl)
  // ]).then((results) => {
  //   let checkResult = results[0]
  //   let faceResult = results[1]

  //   if (checkResult.result.status) {
      
  //     return checkResult.result
  //   }

  //   return {
  //     ...faceResult,
  //     data: {
  //       ...faceResult.data,
  //       faceFileID,
  //       faceImageUrl: imageUrl
  //     }
  //   }
  // }).catch(error => {
  //   console.log('error :', error);

  // })

  
}
