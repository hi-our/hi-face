// 云函数入口文件
const cloud = require('wx-server-sdk')
const uuid = require('uuid')


const uuidv4 = uuid.v4
cloud.init()

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
    const { _id } = await db.collection(collection_name)
      .add({
        // data 字段表示需新增的 JSON 数据
        data: {
          create_time: Date.now(),
          update_time: Date.now(),
          open_id: OPENID,
          app_id: APPID,
          uuid: uuidv4(),
          is_delete: false,
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
    console.log(err)
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