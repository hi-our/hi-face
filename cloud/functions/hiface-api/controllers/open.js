const BaseController = require('./base-controller.js')


class OpenController extends BaseController {
  async createMiniCode(event) {
    let { path = '', width = 300 } = event

    try {
      const { buffer } = await this.cloud.openapi.wxacode.get({
        path,
        width
      })

      let base64Main = buffer.toString('base64')

      return this.success({
        base64Main
      })

    } catch (error) {
      return this.fail(-30000, '生成失败', error)
    }
  }

  async createQRCode(event) {
    let { path = '', width = 300 } = event

    try {
      const { buffer } = await this.cloud.openapi.wxacode.createQRCode({
        path,
        width
      })

      let base64Main = buffer.toString('base64')

      return this.success({
        base64Main
      })

    } catch (error) {
      return this.fail(-30000, '生成失败', error)
    }
  }
}

module.exports = OpenController
