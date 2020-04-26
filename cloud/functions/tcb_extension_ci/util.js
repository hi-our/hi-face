'use strict'
var crypto = require('crypto')

function camSafeUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

module.exports = { getAuth }

function getAuth(opt) {
  opt = opt || {}

  var SecretId = opt.SecretId
  var SecretKey = opt.SecretKey
  var method = (opt.Method || 'get').toLowerCase()
  var queryParams = clone(opt.Query || {})
  var headers = clone(opt.Headers)

  var Key = opt.Key || ''
  var pathname
  if (opt.UseRawKey) {
    pathname = opt.pathname || '/' + Key
  } else {
    pathname = opt.pathname || Key
    pathname.indexOf('/') !== 0 && (pathname = '/' + pathname)
  }

  if (!SecretId) throw new Error('missing param SecretId')
  if (!SecretKey) throw new Error('missing param SecretKey')

  var getObjectKeys = function(obj) {
    var list = []
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        list.push(key)
      }
    }
    return list.sort(function(a, b) {
      a = a.toLowerCase()
      b = b.toLowerCase()
      return a === b ? 0 : a > b ? 1 : -1
    })
  }

  var obj2str = function(obj) {
    var i, key, val
    var list = []
    var keyList = getObjectKeys(obj)
    for (i = 0; i < keyList.length; i++) {
      key = keyList[i]
      val = obj[key] === undefined || obj[key] === null ? '' : '' + obj[key]
      key = key.toLowerCase()
      key = camSafeUrlEncode(key)
      val = camSafeUrlEncode(val) || ''
      list.push(key + '=' + val)
    }
    return list.join('&')
  }

  // 签名有效起止时间
  var now = Math.round(getSkewTime(opt.SystemClockOffset) / 1000) - 1
  var exp = now

  var Expires = opt.Expires || opt.expires
  if (Expires === undefined) {
    exp += 900 // 签名过期时间为当前 + 900s
  } else {
    exp += Expires * 1 || 0
  }

  //   now = 1417773892
  //   exp = 1417853898

  // 要用到的 Authorization 参数列表
  var qSignAlgorithm = 'sha1'
  var qAk = SecretId
  var qSignTime = now + ';' + exp
  var qKeyTime = now + ';' + exp
  var qHeaderList = getObjectKeys(headers)
    .join(';')
    .toLowerCase()
  var qUrlParamList = getObjectKeys(queryParams)
    .join(';')
    .toLowerCase()

  // 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
  // 步骤一：计算 SignKey
  var signKey = crypto
    .createHmac('sha1', SecretKey)
    .update(qKeyTime)
    .digest('hex')

  // 步骤二：构成 FormatString
  var formatString = [
    method,
    pathname,
    obj2str(queryParams),
    obj2str(headers),
    ''
  ].join('\n')
  formatString = Buffer.from(formatString, 'utf8')

  // 步骤三：计算 StringToSign
  var sha1Algo = crypto.createHash('sha1')
  sha1Algo.update(formatString)
  var res = sha1Algo.digest('hex')
  var stringToSign = ['sha1', qSignTime, res, ''].join('\n')

  // 步骤四：计算 Signature
  var qSignature = crypto
    .createHmac('sha1', signKey)
    .update(stringToSign)
    .digest('hex')

  // 步骤五：构造 Authorization
  var authorization = [
    'q-sign-algorithm=' + qSignAlgorithm,
    'q-ak=' + qAk,
    'q-sign-time=' + qSignTime,
    'q-key-time=' + qKeyTime,
    'q-header-list=' + qHeaderList,
    'q-url-param-list=' + qUrlParamList,
    'q-signature=' + qSignature
  ].join('&')

  return authorization
}

function clone(obj) {
  return map(obj, function(v) {
    return typeof v === 'object' ? clone(v) : v
  })
}

function isArray(arr) {
  return arr instanceof Array
}

function map(obj, fn) {
  var o = isArray(obj) ? [] : {}
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = fn(obj[i], i)
    }
  }
  return o
}

function getSkewTime(offset) {
  return Date.now() + (offset || 0)
}
