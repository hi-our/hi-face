
const cloud = require('wx-server-sdk')
const uuid = require('uuid')
const dayjs = require('dayjs')


const uuidv4 = uuid.v4
cloud.init()
const db = cloud.database()

// 下划线转换驼峰
const toHump = (name) => {
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}
// 驼峰转换下划线
const toLine = (name) => {
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
}

const getHumpObject = (obj) => {
  let keys = Object.keys(obj)
  let one = {}
  keys.forEach(key => {
    if (key === '_id') {
      one[key] = obj[key]
    } else {
      one[toHump(key)] = obj[key]
    }
  })
  return one
}

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
      data: getHumpObject(data),
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
const saveWechatInfo = async (event, context) => {

  const { loginType = 'wx_mp', userId = '', openId = '', wechatInfo = {} } = event

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
      let { stats = {} } = await db.collection('users').doc(result[0]._id).update({
        data: {
          wechatInfo
        }
      })

      _id = result[0]._id
    }

    if (_id) {
      const { data } = await db.collection('users').doc(_id).get()
  
      return {
        data: getHumpObject(data),
        message: '',
        status: 0,
        time: Date.now()
      }
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
  const { type = '' } = event
  console.log('type :', type);
  if (type === 'saveWechatInfo') {
    saveWechatInfo(event)
  }

  return getUserInfo(event)
}