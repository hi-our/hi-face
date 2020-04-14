const extCi = require("@cloudbase/extension-ci")
const tcb = require("tcb-admin-node");

tcb.init({
  env: process.env.TCB_ENV === 'local' ? 'development-v9y2f' : process.env.TCB_ENV
})

tcb.registerExtension(extCi);

exports.main = async (event, context) => {
  return imgSecCheck(event)
}

const getResCode = (res) => {
  if (res.statusCode === 200) {
    let result = res.data
    console.log('result :', result);
    if (result.RecognitionResult) {
      const finalResult = result.RecognitionResult
      if (Object.keys(finalResult).length === 0) return finalResult || {} // 某些接口判断返回data字段是否是空对象的逻辑
      return finalResult
    } else {
      throw result
    }
  } else {
    throw res.data
  }
}

const getCheckResult =(data) => {
  const { PornInfo = [], TerroristInfo = [], PoliticsInfo = [] } = data
  const pornOne = PornInfo || {}
  const terroristOne = TerroristInfo || {}
  const politicsOne = PoliticsInfo || {}

  let result = {}

  if (pornOne.HitFlag === 0 && terroristOne.HitFlag === 0 && politicsOne.HitFlag === 0) {
    result.status = 0
    result.data = { isSuccess: true }
    result.message = ''
  } else if (pornOne.HitFlag ||terroristOne.HitFlag || politicsOne.HitFlag) {
    result.status = -1000
    result.message = '存在违禁图片'
  } else if (pornOne.Code || terroristOne.Code || politicsOne.Code) {
    result.status = -1001
    result.message = `pornOne:${pornOne.Code}-terroristOne:${terroristOne.Code}-politicsOne:${politicsOne.Code}`
  } else {
    result.status = -1002
    result.message = '请求失败'
  }

  console.log('审核结果result :', result);
  return result

}


async function imgSecCheck(event) {
  const { fileID } = event
  if (!fileID) {
    console.log('请设置fileID :');
    return 
  }

  try {
    let imgID = fileID.replace('cloud://', '')
    let index = imgID.indexOf('/')
    let cloudPath = imgID.substr(index)


    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'DetectType',
      cloudPath: cloudPath, //需要分析的图像的绝对路径
      operations: { type: ["porn", "terrorist", "politics"] }
    })

    let data = getResCode(res)
    result = getCheckResult(data)
    return result
  } catch (error) {
    console.log('error :', error)
    return error
  }
}

