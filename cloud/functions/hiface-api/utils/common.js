function safeJsonParse(jsonstr) {
  try {
    return JSON.parse(jsonstr)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e)
    return {}
  }
}

module.exports = {
  safeJsonParse
}
