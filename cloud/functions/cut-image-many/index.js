// 云函数入口文件
const extCi = require("@cloudbase/extension-ci");
const tcb = require("tcb-admin-node");

let env = process.env.TCB_ENV === 'local' ? 'development-v9y2f' : process.env.TCB_ENV

tcb.init({
  env
})

tcb.registerExtension(extCi);

exports.main = async (event) => {
  const { fileID = '', imageUrl = '' , ruleList = [] } = event

  console.log('fileID :', fileID);

  if (imageUrl) {
    const list = ruleList.map(item => {
      const { width, height, x, y } = item
      let rule = '|imageMogr2/cut/' + width + 'x' + height + 'x' + x + "x" + y

      return {
        fileImageUrl: imageUrl + rule
      }
    })

    return {
      data: {
        list
      },
      time: new Date(),
      status: 0,
      message: ''
    }
  }

  if (fileID) {
    try {

      let imgID = fileID.replace('cloud://', '')
      let index = imgID.indexOf('/')
      let cloudPath = imgID.substr(index)
      let cloudEnvPath = imgID.substr(0, index)

      const rules = ruleList.map(item => {
        const { width, height, x, y } = item

        let newTime = new Date().getTime()

        let rule = "imageMogr2/cut/" + width + "x" + height + "x" + x + "x" + y

        return {
          ...item,
          fileid: '/cut/' + newTime + parseInt(Math.random() * 10000) + '-' + cloudPath, 
          rule
        }
      })

      await tcb.invokeExtension("CloudInfinite", {
        action: "ImageProcess",
        cloudPath, // 存储图像的绝对路径，与tcb.uploadFile中一致
        //fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
        operations: {
          rules
        }
      })

      let list = rules.map(item => ({
        ...item,
        fileID: cloudEnvPath + item.fileid
      }))

      console.log('list :', list);

      return {
        data: {
          list
        },
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