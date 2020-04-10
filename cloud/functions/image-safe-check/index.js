const extCi = require("@cloudbase/extension-ci");
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
  const pornOne = PornInfo[0] || {}
  const terroristOne = TerroristInfo[0] || {}
  const politicsOne = PoliticsInfo[0] || {}

  let result = {}

  if (pornOne.HitFlag || terroristOne.HitFlag || politicsOne.HitFlag) {
    if (pornOne.HitFlag[0] === '0' && terroristOne.HitFlag[0] == '0' && politicsOne.HitFlag[0] == '0') {
      result.status = 0
      result.data = { isSuccess: true }
      result.messge = ''
    } else {
      result.status = -1000
      result.messge = '存在围巾图片'
    }
  } else if (pornOne.Code[0] || terroristOne.Code[0] || politicsOne.Code[0]) {
    result.status = -1001
    result.messge = `pornOne:${pornOne.Code[0]}-terroristOne:${terroristOne.Code[0]}-politicsOne:${politicsOne.Code[0]}`
  } else {
    result.status = -1002
    result.message = '请求失败'
  }

  console.log('result :', result);
  return result

}


async function imgSecCheck(event) {
  const { Image } = event
  if (!Image) {
    console.log('请设置Image :');
    return 
  }

  try {
    imgID = Image.substr(59)
    console.log('imgID :', imgID);
    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'DetectType',
      cloudPath: imgID, //需要分析的图像的绝对路径
      operations: { type: ["porn", "terrorist", "politics"] }
    })
    console.log(res)

    let data = getResCode(res)
    result = getCheckResult(data)
    return result
  } catch (error) {
    console.log('error :', error)
    return error
  }
}

