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

  const { collection_name, page_no = 1, page_size = 10, condition = {} } = event
  console.log(event)

  try {
    return await db.collection(collection_name)
      .where(condition)
      .skip(page_size * (page_no - 1))
      .limit(page_size)
      .get()
  } catch (err) {
    console.log(err)
  }
}