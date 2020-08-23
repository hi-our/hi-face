const TcbRouter = require('tcb-router')
const ConfigController = require('./controllers/config')
const UserController = require('./controllers/user')
const AvatarController = require('./controllers/avatar')
const ThemeController = require('./controllers/theme')


const api = {
  config: new ConfigController(),
  user: new UserController(),
  avatar: new AvatarController(),
  theme: new ThemeController(),
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
    const result = await api.avatar.save(event)
    ctx.body = result
    await next()
  })
  app.router('avatar/list', async (ctx, next) => {
    const result = await api.avatar.list(event)
    ctx.body = result
    await next()
  })
  app.router('theme/get', async (ctx, next) => {
    const result = await api.theme.get(event)
    ctx.body = result
    await next()
  })
  app.router('theme/list', async (ctx, next) => {
    const result = await api.theme.list(event)
    ctx.body = result
    await next()
  })

  return app.serve()
}