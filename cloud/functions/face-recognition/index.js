require('./promise-allSettled')
const extCi = require("@cloudbase/extension-ci");
const tcb = require('tcb-admin-node')
const detectFace = require('./req-iai-face').detectFace

let env = process.env.TCB_ENV === 'local' ? 'development-v9y2f' : process.env.TCB_ENV

tcb.init({
  env
})
tcb.registerExtension(extCi)


const getResCode = (res) => {
  if (res.statusCode === 200) {
    let result = res.data
    console.log('result :', result);
    if (result.UploadResult) {
      const finalResult = result.UploadResult
      if (Object.keys(finalResult).length === 0) return finalResult || {} // 某些接口判断返回data字段是否是空对象的逻辑
      return finalResult
    } else {
      throw result
    }
  } else {
    throw res.data
  }
}

exports.main = async (event) => {
  const { fileID = '', base64Main = '' } = event

  let Image = ''


  if (fileID) {

    // console.log('fileID :', fileID);
    // const res = await tcb.callFunction({
    //   name: 'image-safe-check',
    //   data: {
    //     fileID
    //   }
    // })

    // console.log('res :', res);

    let imgID = fileID.replace('cloud://', '')
    let index = imgID.indexOf('/')
    let cloudPath = imgID.substr(index)
    let cloudEnvPath = imgID.substr(0, index)

    console.log('cloudEnvPath :', cloudEnvPath);

    let facePath1 = '/face-recognition1'
    let facePath2 = '/face-recognition2'

    
    const opts = {
      rules: [
        {
          // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
          fileid: facePath1 + cloudPath,
          rule: "imageMogr2/thumbnail/!600x600r/cut/600x600/center" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        },
        {
          fileid: facePath2 + cloudPath,
          rule: "imageAve" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        },
        // {
        //   // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
        //   fileid: '/image-process2' + cloudPath,
        //   // rule: "imageMogr2/cut/600x600/scrop/600x600" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        //   // rule: "imageMogr2/thumbnail/!600x600r|scrop/600x600" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        //   rule: "imageMogr2/scrop/100x100" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        // },
        // {
        //   // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
        //   fileid: '/image-process3' + cloudPath,
        //   // rule: "imageMogr2/cut/600x600/scrop/600x600" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        //   // rule: "imageMogr2/thumbnail/!600x600r|scrop/600x600" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        //   rule: "imageMogr2/crop/600x600/center" // 处理样式参数，与下载时处理图像在url拼接的参数一致
        // }
      ]
    }
  

    const res = await tcb.invokeExtension("CloudInfinite", {
      action: "ImageProcess",
      cloudPath: cloudPath, // 存储图像的绝对路径，与tcb.uploadFile中一致
      // fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
      operations: opts
    });

    console.log('ImageProcess res :', res);
    const { ProcessResults } = getResCode(res)
    const { Object: imgList } = ProcessResults
    const faceImageObject = imgList[0]

    let { fileContent } = await tcb.downloadFile({
      fileID: cloudEnvPath + facePath1 + cloudPath
    })

    let Image = fileContent.toString('base64')
    console.log('Image :', Image);
    // 原图是大图的话，压缩到1M以下
    const res2 = await detectFace(Image)
    console.log('res2 :', res2);
    // return res
    // let { fileContent } = await tcb.downloadFile({
    //   fileID
    // })

    // Image = fileContent.toString('base64')
  }
}
