import { apiWeb, apiHost, apiFace } from 'config'

// 报名页面 获取群信息
export const apiGroupInfo = `${apiWeb}/im/v1.3/group/{groupId}/info`

// 我的打卡列表
export const apiMyDakaList = `${apiHost}/daka/v1.1/user/daka_list`


/*
五官分析
https://cloud.tencent.com/document/product/867/32779

Action	是	String	公共参数，本接口取值：AnalyzeFace。
Version	是	String	公共参数，本接口取值：2018-03-01。
Region	否	String	公共参数，本接口不需要传递此参数。
Mode	否	Integer	检测模式。0 为检测所有出现的人脸， 1 为检测面积最大的人脸。默认为 0。最多返回 10 张人脸的五官定位（人脸关键点）具体信息。
Image	否	String	图片 base64 数据，base64 编码后大小不可超过5M。
支持PNG、JPG、JPEG、BMP，不支持 GIF 图片。
Url	否	String	图片的 Url 。对应图片 base64 编码后大小不可超过5M。
Url、Image必须提供一个，如果都提供，只使用 Url。
图片存储于腾讯云的Url可保障更高下载速度和稳定性，建议图片存储于腾讯云。
非腾讯云存储的Url速度和稳定性可能受一定影响。
支持PNG、JPG、JPEG、BMP，不支持 GIF 图片。
FaceModelVersion	否	String	人脸识别服务所用的算法模型版本。目前入参支持 “2.0”和“3.0“ 两个输入。
默认为"2.0"。
不同算法模型版本对应的人脸识别算法不同，新版本的整体效果会优于旧版本，建议使用最新版本。

*/
export const apiAnalyzeFace = `${apiFace}/api/analyze-face`

export const apiMyHello = `${apiFace}/api/hello`