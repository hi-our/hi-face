const TcbRouter = require('tcb-router')
const ConfigController = require('./controllers/config')
const UserController = require('./controllers/user')
const AvatarController = require('./controllers/avatar')
const ThemeController = require('./controllers/theme')
const OpenController = require('./controllers/open')


const api = {
  config: new ConfigController(),
  user: new UserController(),
  avatar: new AvatarController(),
  theme: new ThemeController(),
  open: new OpenController(),
}

exports.main = (event, context) => {
  const app = new TcbRouter({ event })

  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  app.router('config/get', async (ctx) => {
    ctx.body = await api.config.get(event)
  })
  app.router('user/get', async (ctx) => {
    ctx.body = await api.user.get(event)
  })
  app.router('user/save', async (ctx) => {
    ctx.body = await api.user.save(event)
  })
  
  app.router('avatar/get', async (ctx) => {
    ctx.body = await api.avatar.get(event)
  })
  app.router('avatar/save', async (ctx) => {
    ctx.body = await api.avatar.save(event)
  })
  app.router('avatar/list', async (ctx) => {
    ctx.body = api.avatar.list(event)
  })
  app.router('theme/get', async (ctx) => {
    ctx.body = await api.theme.get(event)
  })
  app.router('theme/list', async (ctx) => {
    ctx.body = await api.theme.list(event)
  })
  app.router('open/createMiniCode', async (ctx) => {
    ctx.body = await api.open.createMiniCode(event)
  })
  app.router('open/createQRCode', async (ctx) => {
    ctx.body = await api.open.createQRCode(event)
  })

  return app.serve()
}