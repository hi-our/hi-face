const tcb = require('tcb-admin-node')
const config = require('./config')
const ChangeAgePic = require('./req-change-age').ChangeAgePic

// 腾讯云的id和key
let secretId = config.SecretId || ''
let secretKey = config.SecretKey || ''

tcb.init({
  secretId,
  secretKey,
})

console.log('tcb.getCurrentEnv() :', tcb.getCurrentEnv());


const getDefaultValue = (status = -10086) => ({
  data: {},
  time: new Date(),
  status,
  message: '请设置正确的fileID或base64Main',
})

exports.main = async (event) => {
  const { fileID = '', base64Main = '', AgeInfos = [] } = event

  let Image = ''


  if (fileID) {

    let oldTime = Date.now()

    console.log('fileID :', fileID);
    try {
      // let { fileContent = '' } = await tcb.downloadFile({
      //   fileID
      // })

      let result = await tcb.getTempFileURL({
        fileList: [fileID]
      })

      const { tempFileURL = '' } = result.fileList[0] || {}

      if (!tempFileURL) {
        return getDefaultValue(-10087)
      }
  
      return ChangeAgePic(tempFileURL, AgeInfos).then(res => {
        console.log('图片转换花费时间', ((Date.now() - oldTime) / 1000).toFixed(1) + '秒')
        return res
      })
      
    } catch (error) {
      console.log('error :', error);
    }
  } else if (base64Main) {
    Image = base64Main
    return ChangeAgePic(Image, AgeInfos)
  }
  return getDefaultValue()

}