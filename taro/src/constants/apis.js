import { apiWeb, apiHost, apiFace } from 'config'

// 报名页面 获取群信息
export const apiGroupInfo = `${apiWeb}/im/v1.3/group/{groupId}/info`

// 我的打卡列表
export const apiMyDakaList = `${apiHost}/daka/v1.1/user/daka_list`


export const apiMyFace = `${apiFace}/api/face-detection`

export const apiMyHello = `${apiFace}/api/hello`