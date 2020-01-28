
let user = {}
if (process.env.TARO_ENV === 'weapp') {
  user = require('./user-wx')
} else if (process.env.TARO_ENV === 'tt') {
  user = require('./user-tt')
}

module.exports = user
