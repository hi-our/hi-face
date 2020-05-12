// 云函数入口文件
const cloud = require('wx-server-sdk')
const uuid = require('uuid')


const uuidv4 = uuid.v4
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

  const { collection_name, info = {} } = event
  console.log(event)
  
  const { OPENID, APPID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

  console.log('cloud.getWXContext() :', cloud.getWXContext());

  try {
    const result = await db.collection('users').where({
      wxOpenId: OPENID
    }).get()
    const {  user_id = '', userId = ''} = result.data[0] || {}
    console.log('user_id', result.data, user_id)
    const { _id } = await db.collection(collection_name)
      .add({
        // data 字段表示需新增的 JSON 数据
        data: {
          createTime: Date.now(),
          updateTime: Date.now(),
          openId: OPENID,
          appId: APPID,
          uuid: uuidv4(),
          isDelete: false,
          userId: userId || user_id || 0,
          ...info
        }
      })
    
    const one = await db.collection(collection_name)
      .doc(_id)
      .field({
        _id: false,
        is_delete: false,
        app_id: false,

      })
      .get()


    return {
      data: one.data,
      time: new Date(),
      status: 0,
      message: ''
    }

  } catch (error) {
    console.log(error)
    return {
      data: {
        error
      },
      time: new Date(),
      status: -10010,
      message: '添加失败'
    }
  }
}