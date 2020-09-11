const BaseController = require('./base-controller.js')
const safeJsonParse = require('../utils/common').safeJsonParse

const COLLECTION_NAME = 'hiface-configs'

class ConfigController extends BaseController {
  async get(event) {
    const { configName } = event

    let result = await this.cloud.db.collection(COLLECTION_NAME)
      .where({
        name: configName
      })
      .limit(1)
      .field({
        content: true
      })
      .get()
      .then(result => {
        console.log('result :>> ', result)
        let { data } = result
        data = data.map(item => {
          return safeJsonParse(item.content)
        })
        console.log('data :>> ', data);
        return this.success(data.length === 1 ? data[0] : data)
      })
      .catch(() => this.fail())

    return result
  }
}

module.exports = ConfigController
