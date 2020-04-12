const tcb = require('tcb-admin-node')
const fetch = require('axios')

let env = process.env.TCB_ENV === 'local' ? 'development-v9y2f' : process.env.TCB_ENV

tcb.init({
  env
})

function hexToRgba(hex = '', opacity) {
  var RGBA = 'rgba(' + parseInt('0x' + hex.slice(1, 3)) + ',' + parseInt('0x' + hex.slice(3, 5)) + ',' + parseInt('0x' + hex.slice(5, 7)) + ',' + opacity + ')'
  return {
    red: parseInt('0x' + hex.slice(1, 3)),
    green: parseInt('0x' + hex.slice(3, 5)),
    blue: parseInt('0x' + hex.slice(5, 7)),
    rgba: RGBA
  }
}

const getImageUrl = async (fileID) => {
  const { fileList } = await tcb.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}

const getResCode = (res) => {
  console.log('res :', res);
  if (res.status === 200) {
    let result = res.data
    console.log('result :', result);
    if (result) {
      const finalResult = result
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
  const { fileID = '', opacity = 1, colorType = 'default' } = event

  console.log('fileID :', fileID);

  if (fileID) {
    try {
      const imgUrl = await getImageUrl(fileID)
      const res = await fetch.get(imgUrl + '?imageAve')
      const { RGB } = getResCode(res)
  
      const colorHex = '#' + RGB.substring(2)
      const colorRgbaObj = hexToRgba(colorHex, opacity)
      const colorRgba = colorRgbaObj.rgba
      const colorRgb = `rgb(${colorRgbaObj.red}, ${colorRgbaObj.green}, ${colorRgbaObj.blue})`
  
      // 支持多种颜色获取方式
      let mainColor = opacity === 1 ? colorHex : colorRgba
      if (colorType === 'hex') {
        mainColor = colorHex
      } else if (colorType === 'rgb') {
        mainColor = colorRgb
      }

      return {
        data: {
          mainColor
        },
        time: new Date(),
        status: 0,
        message: ''
      }
      
    } catch (error) {
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