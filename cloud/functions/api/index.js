const TcbRouter = require('tcb-router')
const ConfigController = require('./controllers/config')
const UserController = require('./controllers/user')
const AvatarController = require('./controllers/avatar')


const api = {
  config: new ConfigController(),
  user: new UserController(),
  avatar: new AvatarController(),
}

exports.main = (event, context) => {
  const app = new TcbRouter({ event })

  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  app.router('config/get', async (ctx, next) => {
    const result = await api.config.get(event)
    ctx.body = result
    await next()
  })
  app.router('user/get', async (ctx, next) => {
    const result = await api.user.get(event)
    ctx.body = result
    await next()
  })
  app.router('user/save', async (ctx, next) => {
    const result = await api.user.save(event)
    ctx.body = result
    await next()
  })
  
  app.router('avatar/get', async (ctx, next) => {
    const result = await api.avatar.get(event)
    ctx.body = result
    await next()
  })
  app.router('avatar/save', async (ctx, next) => {
    console.log('event :>> ', event);
    const result = await api.avatar.save(event)
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