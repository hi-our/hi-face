const BaseController = require('./base-controller.js')
const timeFormat = require('../utils/times').timeFormat
const uuid = require('uuid')

const uuidv4 = uuid.v4

const LOGIN_TYPE_MAP = {
  wx_mp: 'wxOpenId',
  qq_mp: 'qqOpenId',
  web_mp: 'qqOpenOd',
}

const COLLECTION_NAME = 'users'

class UserController extends BaseController {
  async get(event) {
    const { loginType = 'wx_mp', openId = '' } = event

    // 微信环境下获取openId
    const { OPENID } = this.cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
    let _open_id = openId || OPENID

    try {
      // 查询是否当前环境下有该用户
      let result = (await this.cloud.db.collection('users').where({
        [LOGIN_TYPE_MAP[loginType]]: _open_id
      }).get()).data

      let userData = null
      if (result.length !== 0 && result[0]._id) {
        userData = result[0]
      } else {
        // 若没有该用户，新增一个用户数据
        let saveData = {
          // 用户唯一标识符 userId
          userId: uuidv4(),
          createTime: timeFormat(),
          updateTime: timeFormat(),
        }
        // 记录当前环境下的openId
        saveData[LOGIN_TYPE_MAP[loginType]] = _open_id

        let res = await this.cloud.db.collection('users').add({
          data: saveData
        })
        userData = res.data
      }

      return this.success(userData)
    } catch (e) {
      console.log('《WARN》代码错误：', e)
      return this.fail(-10086, 'user/get error', e)
    }
  }

  async save(event) {
    // 保存用户信息
    const { loginType = 'wx_mp', openId = '', wechatInfo = {} } = event
    const { OPENID } = this.cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

    let _open_id = openId || OPENID
    try {
      let result = (await this.cloud.db.collection(COLLECTION_NAME).where({
        [LOGIN_TYPE_MAP[loginType]]: _open_id
      }).get()).data

      let _id = ''
      if (result.length !== 0 && result[0]._id) {
        await this.cloud.db.collection(COLLECTION_NAME).doc(result[0]._id).update({
          data: {
            wechatInfo,
            updateTime: timeFormat()
          }
        })

        _id = result[0]._id
      }

      if (_id) {
        const { data } = await this.cloud.db.collection(COLLECTION_NAME).doc(_id).get()
        return this.success(data)
      }
    } catch (e) {
      console.log('代码错误：', e)
      return this.fail(-10086, '获取失败', e)
    }
  }
}

module.exports = UserController
