const timeFormat = require('../utils/times').timeFormat

class BaseController {
  /**
   * 调用成功
   */
  success(data) {
    console.log('success data:>> ', data)
    return { status: 0, data, message: '', time: timeFormat() }
  }

  /**
   * 调用失败
   */
  fail(status = -1, message = 'api error') {
    return { message, status }
  }
}

module.exports = BaseController
