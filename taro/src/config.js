const env = process.env.SERVER_ENV || 'prod'
const appId = 'wxd5e8989ce23206af'

module.exports = {
  env,
  wxName: 'quickly-mask',
  version: '1.5.0',
  appId,
  userDomain: 'cc',
  apiHost: `https://${env !== 'prod' ? env : ''}ccdaka.hjapi.com`,
  apiWeb: `https://${env !== 'prod' ? env : ''}cctalk.hjapi.com`,
  apiFace: 'https://face.xuexitrip.com',
  apiImageUpload: `https://${env !== 'prod' ? 'qa' : ''}ccfile.hjapi.com`,
  tokenKey: env === 'prod' || env === 'yz' ? 'ClubAuth' : 'ClubAuth_DEV',
  webViewDomain: `https://${env !== 'prod' ? env : ''}www.cctalk.com`,
  cloudEnv: env === 'prod' ? 'production-topjt' : 'development-v9y2f',
}
