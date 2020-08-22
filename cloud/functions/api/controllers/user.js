const BaseController = require('./base-controller.js')

const LOGIN_TYPE_MAP = {
  wx_mp: 'wxOpenId',
  qq_mp: 'qqOpenId',
  web_mp: 'qqOpenOd',
}


class UserController extends BaseController {
  async get(event) {
    const { loginType = 'wx_mp', userId = '', openId = '' } = event
    const { OPENID, APPID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
    console.log('OPENID :>> ', LOGIN_TYPE_MAP[loginType], OPENID);
    let _open_id = openId || OPENID
    // let queryParams = {}
    // if (userId) {
    //   queryParams.userId = userId
    // }
    // queryParams[LOGIN_TYPE_MAP[loginType]] = _open_id
    let result = db.collection('users')
      .where({
        [LOGIN_TYPE_MAP[loginType]]: _open_id
      })
      .limit(1)
      .get()
      .then(res => {
        return this.success(res.data.length === 1 ? res.data[0] : {})
      })
      .catch((error) => {
        console.log('error :>> ', error);
        this.fail()
      })
    return result

  }
}

module.exports = UserController
