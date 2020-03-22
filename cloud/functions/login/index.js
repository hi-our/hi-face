
const cloud = require('wx-server-sdk')
const uuid = require('uuid')
const dayjs = require('dayjs')


const uuidv4 = uuid.v4
cloud.init()
const db = cloud.database()

const LOGIN_TYPE_MAP = {
  wx_mp: 'wx_open_id',
  qq_mp: 'qq_open_id',
  web_mp: 'qq_open_id',
}

const getSaveData = () => {
  let randomCode = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
  let saveData = {
    pass_code: randomCode,
    last_time: db.serverDate({
      offset: 5 * 60 * 1000
    })
  }

  return saveData
}

const getUserInfo = async (event, context) => {

  const { loginType = 'wx_mp', userId = '', openId = '' } = event

  const { OPENID, APPID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  let _open_id = openId || OPENID

  try {
    let queryParams = {}
    if (userId) {
      queryParams.user_id = userId
    }
    queryParams[LOGIN_TYPE_MAP[loginType]] = _open_id

    let result = (await db.collection('users').where({
      [LOGIN_TYPE_MAP[loginType]]: _open_id
    }).get()).data;
 
    let _id = ''
    if (result.length != 0 && result[0]._id) {
      const { last_time } = result[0]

      // 五分钟后更换数据
      if (dayjs().isAfter(last_time)) {
        console.log('last_time :', last_time);
        console.log('dayjs() :', dayjs(last_time));
        let saveData = getSaveData()
        let { stats = {} } = await db.collection('users').doc(result[0]._id).update({
          data: saveData
        })


        if (stats.updated > 0) {
          _id = result[0]._id
        }
      } else {
        _id = result[0]._id
      }
      

    } else {

      let saveData = getSaveData()
      saveData.user_id = uuidv4()
      saveData[LOGIN_TYPE_MAP[loginType]] = _open_id

      let res = await db.collection('users').add({
        data: saveData
      })

      _id = res._id

    }

    const { data } = await db.collection('users').doc(_id).get()

    return {
      data,
      message: '',
      status: 0,
      time: Date.now()
    }

  } catch (e) {
    console.log('《WARN》代码错误：', e);
    return {
      data: e,
      message: '获取失败',
      status: -10086,
      time: Date.now()
    }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {

  return getUserInfo(event)
}