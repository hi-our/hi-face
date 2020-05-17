// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {

  /**
   * page: 第几页
   * num: 每页几条数据
   * condition： 查询条件，例如 { name: '李白' }
   */

  const { collection_name, uuid = '' } = event
  console.log(event)

  const { OPENID, APPID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

  try {
    let { data = [] } = await db.collection(collection_name)
      .where({
        uuid,
        isDelete: false
      })
      .field({
        _id: false,
        isDelete: false,
        appId: false,
      })
      .get()
    


    if (data.length) {
      console.log('data[0] :', data[0]);
      console.log('PENID === data[0].openId :', OPENID, data[0].openId);
      return {
        data: {
          ...data[0],
          isAuthor: OPENID === data[0].openId
        },
        time: new Date(),
        status: 0,
        message: ''
      }
    }

    return {
      data: data[0],
      time: new Date(),
      status: -10001,
      message: '数据不存在'
    }
    
  } catch (err) {
    console.log(err)
  }
}