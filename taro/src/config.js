const env = process.env.SERVER_ENV || 'prod'
const appId = 'wxd5e8989ce23206af'

module.exports = {
  env,
  wxName: 'hi-face',
  version: '2.1.0',
  appId,
  cloudEnv: env === 'prod' ? 'production-topjt' : 'development-v9y2f',
}
