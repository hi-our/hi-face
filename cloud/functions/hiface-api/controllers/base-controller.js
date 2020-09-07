const timeFormat = require('../utils/times').timeFormat
const cloud = require('../tcb')

class BaseController {
  constructor() {
    this.cloud = cloud
  }
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
  fail(status = -1, message = 'api error', data = {}) {
    return { message, status, data }
  }
}

module.exports = BaseController
