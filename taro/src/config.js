const env = process.env.SERVER_ENV || 'prod'
const appId = 'wxd5e8989ce23206af'

module.exports = {
  env,
  wxName: 'quickly-mask',
  version: '1.5.0',
  appId,
  userDomain: 'cc',
  apiHost: '',
  apiWeb: '',
  apiFace: 'https://face.xuexitrip.com',
  apiImageUpload: '',
  tokenKey: '',
  webViewDomain: '',
  cloudEnv: env === 'prod' ? 'production-topjt' : 'development-v9y2f',
}
