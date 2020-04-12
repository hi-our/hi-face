// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {

  /**
   * page: 第几页
   * num: 每页几条数据
   * condition： 查询条件，例如 { name: '李白' }
   */

  const { collection_name, page_no = 1, page_size = 10, condition = {}, orderBy = {} } = event
  console.log(event)

  const { OPENID, APPID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

  
  try {
    let operation = db.collection(collection_name)
      .where({
        open_id: OPENID,
        ...condition
      })
      .skip(page_size * (page_no - 1))
      .limit(page_size)
      .field({
        _id: false,
        is_delete: false,
        app_id: false,
      })

      console.log('orderType :', orderBy);
    if (orderBy.field) {
      operation = operation.orderBy(orderBy.field, orderBy.orderType || 'desc')
    }
    let { data = [] } = await operation.get()
    
    return {
      data,
      time: new Date(),
      status: 0,
      message: ''
    }

  } catch (err) {
    console.log(err)
    return {
      data: err,
      time: new Date(),
      status: -10001,
      message: '数据不存在'
    }
  }
}