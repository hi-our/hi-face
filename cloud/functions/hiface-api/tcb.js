const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
  // env: 'production-topjt'
  // env: 'development-v9y2f'
})


let tcb = cloud
tcb.db = cloud.database()
tcb._ = tcb.db.command
tcb.$ = tcb._.aggregate

module.exports = tcb
