import WxReport from '@hujiang/wechat-report'
import * as config from 'config'


let logger = null


export function loggerInit() {
  logger = new WxReport({
    env: config.env,
    appId: config.appId,
    project: config.projectId,
    business: config.businessId,
    miniAppType: process.env.TARO_ENV === 'tt' ? 'douyin' : '',
    reportType: process.env.TARO_ENV === 'tt' ? 'douyin' : ''
  })
}

export function getLogger() {
  return logger
} 



