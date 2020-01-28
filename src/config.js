const env = process.env.SERVER_ENV || 'prod'
const appId = 'wxd5e8989ce23206af'

module.exports = {
  env,
  wxName: 'taro-framework',
  version: '1.6.18',
  appId,
  userDomain: 'cc',
  apiHost: `https://${env !== 'prod' ? env : ''}ccdaka.hjapi.com`,
  apiWeb: `https://${env !== 'prod' ? env : ''}cctalk.hjapi.com`,
  apiTencent: `http://face.xuexitrip.com`,
  apiImageUpload: `https://${env !== 'prod' ? 'qa' : ''}ccfile.hjapi.com`,
  tokenKey: env === 'prod' || env === 'yz' ? 'ClubAuth' : 'ClubAuth_DEV',
  webViewDomain: `https://${env !== 'prod' ? env : ''}www.cctalk.com`,
  projectId: '9900', // 小程序类目
  businessId: '1000',

  // 打点配置
  wxaKey: '305cbe4769be61c9fb9366cfe0df0710', // 必填 请在此行填写从BI的utrack平台接入时获取的wxa_key
  scope: {
    userLocation: false, // 是否允许bi sdk主动发起位置弹窗询问
    userInfo: false // 是否允许bi sdk主动发起用户信息弹窗询问
  },
  isProductEnv: env === 'prod' || env === 'yz', // 是否是生产环境，生产环境走线上接口，非生产环境走qa接口(据说现在只有线上)
  tag: 'wxa_cctalk_dky',
  isInnerGetOpenId: false // bisdk获取openId
}
