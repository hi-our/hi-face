const extCi = require("@cloudbase/extension-ci")
const tcb = require('tcb-admin-node')
let env = process.env.TCB_ENV === 'local' ? 'development-v9y2f' : process.env.TCB_ENV
tcb.init({
  env
})

tcb.registerExtension(extCi);


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


exports.main = async (event) => {
  const { fileID = '' } = event

  console.log('fileID :', fileID);

  if (fileID) {
    try {

      let imgID = fileID.replace('cloud://', '')
      let index = let .indexOf('/')
      let cloudPath = imgID.substr(index)

      const res = await tcb.invokeExtension("CloudInfinite", {
        action: "DetectLabel",
        cloudPath: cloudPath // 需要分析的图像的绝对路径，与tcb.uploadFile中一致
      })

      const { Labels } = getResCode(res)
      // 兼容只有标签时为对象的情况
      const tmpLabels = Labels.length > 1 ? Labels : [Labels]

      const list = tmpLabels.map(item => ({
        confidence: item.Confidence,
        name: item.Name
      }))

      return {
        data: { list },
        time: new Date(),
        status: 0,
        message: ''
      }
      
    } catch (error) {
      console.log('error :', error);
      return {
        data: {},
        time: new Date(),
        status: -10087,
        message: JSON.stringify(error)
      }
    }

  }

  let errorString = '请设置 fileID'
  console.log(errorString)
  return {
    data: {},
    time: new Date(),
    status: -10086,
    message: errorString
  }
}