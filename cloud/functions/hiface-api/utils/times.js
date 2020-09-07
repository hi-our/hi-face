/**
 * 时间处理工具，包含格式化、生成对应中文格式等
 *
 * @module utils/times
 */
const dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

dayjs.locale('zh-cn')
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * 时间格式化
 * @param  {string} date    合法时间字符串
 * @param  {string} _format 格式化的目标格式
 * @param  {string} _timezone 时区
 * @returns {string} 格式化后的字符串
 */
const timeFormat = (date, _format = '', _timezone) => {
  if (!date) {
    date = new Date()
  }

  let dataObj = dayjs(date)
  if (_timezone) {
    dataObj = dataObj.tz(_timezone)
  }

  if (!_format) {
    return dataObj.format()
  }

  return dataObj.format(_format)
}

const dateToNumber = (date) => {
  // 毫秒
  const unixTime = dayjs(date).valueOf()

  if (isNaN(unixTime)) {
    throw new Error(`Invalid Date Type: ${date}`)
  }

  return unixTime
}

module.exports = {
  timeFormat,
  dateToNumber
}

