// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const ConfigController = require('./controllers/config')
const UserController = require('./controllers/user')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

global.cloud = cloud
global.db = cloud.database()
global._ = global.db.command
global.$ = global._.aggregate

const api = {
  config: new ConfigController(),
  user: new UserController(),
}

exports.main = (event, context) => {
  const app = new TcbRouter({ event })

  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  app.router('config/get', async (ctx, next) => {
    console.log('event :>> ', event);
    const result = await api.config.get(event)
    console.log('result :>> ', result);
    ctx.body = result
    await next()
  })
  app.router('user/get', async (ctx, next) => {
    console.log('event :>> ', event);
    const result = await api.user.get(event)
    console.log('result :>> ', result);
    ctx.body = result
    await next()
  })

  // app.router(['user', 'timer'], async (ctx, next) => {
  //   ctx.data.company = 'Tencent'
  //   await next()
  // })

  // app.router('user', async (ctx, next) => {
  //   ctx.data.name = 'heyli'
  //   await next()
  // }, async (ctx, next) => {
  //   ctx.data.sex = 'male'
  //   await next()
  // }, async (ctx) => {
  //   ctx.data.city = 'Foshan'
  //   ctx.body = { code: 0, data: ctx.data }
  // })


  return app.serve()
}