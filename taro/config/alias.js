const path = require('path')

const srcPath = path.resolve(__dirname, '../src')
const joinSrc = (_path) => path.join(srcPath, _path)

module.exports = {
  '@': srcPath,
  utils: joinSrc('utils'),
  constants: joinSrc('constants'),
  config: joinSrc('config.js'),
  page: joinSrc('page.js'),
  components: joinSrc('components'),
  types: joinSrc('types'),
  mirror: joinSrc('utils/mirror'),
}
