function safeJsonParse(jsonstr) {
  try {
    return JSON.parse(jsonstr)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e)
    return {}
  }
}

function getSplitString(fileId = '') {
  return fileId.includes('/cloudbase-cms/upload/') ? '/cloudbase-cms/upload/' : '/uploads/'
}

module.exports = {
  safeJsonParse,
  getSplitString
}
