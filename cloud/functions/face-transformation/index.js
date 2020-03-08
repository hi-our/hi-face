const tcb = require('tcb-admin-node')
const config = require('./config')
const ChangeAgePic = require('./req-change-age').ChangeAgePic

// 腾讯云的id和key
let secretId = config.SecretId || ''
let secretKey = config.SecretKey || ''

tcb.init({
  secretId,
  secretKey,
  env: tcb.getCurrentEnv()
})



exports.main = async (event) => {
  const { fileID = '', base64Main = '', AgeInfos = [] } = event

  let Image = ''


  if (fileID) {
    try {
      let { fileContent = '' } = await tcb.downloadFile({
        fileID
      })
  
      Image = fileContent.toString('base64')
  
      return ChangeAgePic(Image, AgeInfos)
      
    } catch (error) {
      console.log('error :', error);
    }
  } else if (base64Main) {
    Image = base64Main
    return ChangeAgePic(Image, AgeInfos)
  }
  
  let errorString = '请设置正确的fileID或base64Main'
  console.log(errorString)
  return {
    data: {},
    time: new Date(),
    status: -10086,
    message: errorString,
  }

}