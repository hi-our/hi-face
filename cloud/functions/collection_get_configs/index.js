// 云函数入口文件
const cloud = require('wx-server-sdk')

// console.log('process.env :>> ', process.env)

function safeJsonParse(jsonstr) {
  try {
    return JSON.parse(jsonstr)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e)
    return {}
  }
}

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  const { configName = '', configList } = event
  console.log('typeof configList :>> ', typeof configList);
  const orList = configList.map(item => ({
    name: item
  }))

  let dbNow = db.collection('configs').limit(10)
  if (configList && configList.length) {
    dbNow = dbNow.where(_.or(orList)).field({
      content: true
    })
  } else if (configName) {
    dbNow = dbNow.where({
      name: configName
    }).limit(1)
  }


  let { data } = await dbNow.get()
  data = data.map(item => {
    return safeJsonParse(item.content)
  })

  
  let result = data.length === 1 ? data[0] : data
  console.log('result :>> ', result);
  
  return {
    data: result,
    status: 0,
    message: '',
    time: new Date()
  }
}