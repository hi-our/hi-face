// 云函数入口文件
const extCi = require("@cloudbase/extension-ci");
const tcb = require("tcb-admin-node");

let env = process.env.TCB_ENV === 'local' ? 'development-v9y2f' : process.env.TCB_ENV

tcb.init({
  env
})

tcb.registerExtension(extCi);

// 云函数入口函数
// exports.main = async (event, context) => {
//   const { fileID, faceInfos } = event
//   console.log(fileID)
//   imgID = fileID.replace('cloud://', '')
//   let index = imgID.indexOf('/')
//   imgID = imgID.substr(index)
//   return cropImg(imgID, faceInfos)
// }

// async function cropImg(imgID, ) {
//   let rules = []

//   for (let i = 0; i < faceInfos.length; i++) {
//     let newTime = new Date().getTime()
//     let { Width, Height, X, Y } = faceInfos[i]

//     let temRule = "imageMogr2/cut/" + Width + "x" + Height + "x" + X + "x" + Y
//     let rule = { 'fileid': '/corpTest/' + i + newTime + '.png', 'rule': temRule }
//     rules.push(rule)
//   }

//   try {
//     const opts = {
//       rules: rules
//     };
//     console.log('==========================')
//     const res = await tcb.invokeExtension("CloudInfinite", {
//       action: "ImageProcess",
//       cloudPath: imgID, // 存储图像的绝对路径，与tcb.uploadFile中一致
//       //fileContent, // 该字段可选，文件内容：Uint8Array|Buffer。有值，表示上传时处理图像；为空，则处理已经上传的图像
//       operations: opts
//     });
//     // console.log(res)
//     console.log(JSON.stringify(res.data, null, 4));
//     return res.data
//   } catch (err) {
//     console.log(err)
//     return err
//     //console.log(JSON.stringify(err, null, 4));
//   }
// }

exports.main = async (event) => {
  const { fileID = '', ruleList } = event

  console.log('fileID :', fileID);

  if (fileID) {
    try {

      imgID = fileID.replace('cloud://', '')
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