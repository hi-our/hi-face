const BaseController = require('./base-controller.js')
const uuid = require('uuid')
const timeFormat = require('../utils/times').timeFormat

const uuidv4 = uuid.v4

const COLLECTION_NAME = 'avatars'

class AvatarController extends BaseController {
  async get(event) {
    const { uuid } = event

    let result = await this.cloud.db.collection(COLLECTION_NAME)
      .where({
        uuid,
        isDelete: false
      })
      .limit(1)
      .field({
        _id: false,
        isDelete: false,
        appId: false,
      })
      .get()
      .then(result => {
        let { data } = result

        if (data && data.length >= 1) return this.success(data[0])

        return this.fail(-10000, '数据不存在')
      })
      .catch(() => this.fail())

    return result
  }

  async save(event) {
    /**
   * page: 第几页
   * num: 每页几条数据
   * condition： 查询条件，例如 { name: '李白' }
   */

    const { avatarFileID, ageType, themeId, themeName } = event
    console.log(event)

    const { OPENID, APPID } = this.cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

    try {
      const result = await this.cloud.db.collection('users').where({
        wxOpenId: OPENID
      }).get()

      const { user_id = '', userId = '' } = result.data[0] || {}
      console.log('user_id', result.data, user_id)
      const { _id } = await this.cloud.db.collection(COLLECTION_NAME)
        .add({
          // data 字段表示需新增的 JSON 数据
          data: {
            createTime: timeFormat(),
            updateTime: timeFormat(),
            openId: OPENID,
            appId: APPID,
            uuid: uuidv4(),
            isDelete: false,
            userId: userId || user_id || 0,
            avatarFileID,
            ageType,
            themeId,
            themeName
          }
        })

      const one = await this.cloud.db.collection(COLLECTION_NAME)
        .doc(_id)
        .field({
          _id: false,
          isDelete: false,
          appId: false,

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
}

module.exports = AvatarController
