const env = process.env.SERVER_ENV || 'prod'
const appId = 'wxd5e8989ce23206af'

module.exports = {
  env,
  wxName: 'hi-face',
  version: '2.0.0',
  appId,
  userDomain: 'cc',
  apiHost: '',
  apiWeb: '',
  apiImageUpload: '',
  tokenKey: '',
  webViewDomain: '',
  envId: process.env.SERVER_ENV === 'dev' ? 'development-v9y2f' : 'production-topjt' ,
}
