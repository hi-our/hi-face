const extCi = require("@cloudbase/extension-ci")
const tcb = require("tcb-admin-node");

const translateEnv = (env) => {
  if (!env) {
    return undefined
  }

  if (env === tcb.SYMBOL_CURRENT_ENV) {
    env = tcb.getCurrentEnv()
  }
  // in scf local debug, we should not use 'local' as env in api invocation
  if (env === 'local' && process.env.TENCENTCLOUD_RUNENV === 'WX_LOCAL_SCF') {
    return undefined
  }
  return env
}

tcb.init({
  env: translateEnv(tcb.SYMBOL_CURRENT_ENV)
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

const getResultInfo = (data, cloudEnvPath) => {
  const { ProcessResults } = data
  // const { ProcessResults } = data
  let { Key, Width, Height } = ProcessResults.Object
  return {
    fileID: 'cloud://' + cloudEnvPath + '/' + Key,
    width: Width,
    height: Height
  }
}


// 云函数入口函数
exports.main = async (event, context) => {
  const { type = '' } = event
  if (type === 'parse') {
    return imageWatetMarkParse(event)
  }

  return imageWatetMark(event)
}

const getImagePath = (fileID) => {
  let imgID = fileID.replace('cloud://', '')
  let index = imgID.indexOf('/')
  let cloudPath = imgID.substr(index)
  let cloudEnvPath = imgID.substr(0, index)

  return {
    cloudPath,
    cloudEnvPath
  }
}

async function imageWatetMark(event) {
  const { fileID, waterType = 3, waterText = '', waterFileID = ''} = event

  if (!fileID) {
    console.log('请设置fileID :')
    return
  }

  try {
    const { cloudPath, cloudEnvPath } = getImagePath(fileID)

    const opts = {
      rules:
        [
          {
            // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
            fileid: '/watermark' + cloudPath,
            rule: { // 添加水印处理规则
              mode: 3,
              type: waterType,
              text: waterText, // 支持数字[0 - 9]及英文大小写[A - Z,a - z]
              image: getImagePath(waterFileID).cloudPath
            }
          }
        ]
    }

    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'WaterMark',
      cloudPath: cloudPath, //需要分析的图像的绝对路径
      operations: opts
    })

    let data = getResCode(res)
    let result = getResultInfo(data, cloudEnvPath)
    return {
      data: result,
      status: 0,
      message: '',
      time: new Date()
    }
  } catch (error) {
    console.log('error :', error)
    return {
      data: '',
      status: -30002,
      message: JSON.stringify(error),
      time: new Date()
    }
  }
}
async function imageWatetMarkParse(event) {
  const { fileID, waterType = 3, waterText = '', waterFileID = '' } = event
  if (!fileID) {
    console.log('请设置fileID :')
    return
  }

  try {
    const { cloudPath, cloudEnvPath } = getImagePath(fileID)

    const opts = {
      rules:
        [
          {
            // 处理结果的文件路径，如以’/’开头，则存入指定文件夹中，否则，存入原图文件存储的同目录
            fileid: '/watermark/parse' + cloudPath,
            rule: { // 添加水印处理规则
              mode: 4,
              type: waterType,
              text: waterText, // 支持数字[0 - 9]及英文大小写[A - Z,a - z]
              image: getImagePath(waterFileID).cloudPath
            }
          }
        ]
    }


    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'WaterMark',
      cloudPath: cloudPath, //需要分析的图像的绝对路径
      operations: opts
    })

    
    let data = getResCode(res)
    
    let result = getResultInfo(data, cloudEnvPath)

    console.log('fileID :>> ', result.fileID);
    
    return {
      data: result,
      status: 0,
      message: '',
      time: new Date()
    }
  } catch (error) {
    console.log('error :', error)
    return {
      data: '',
      status: -30003,
      message: JSON.stringify(error),
      time: new Date()
    }
  }
}
