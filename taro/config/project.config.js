const APPID_ENV = process.env.APPID_ENV

module.exports = {
  miniprogramRoot: APPID_ENV ? './dist_test' : './dist',
  projectname: APPID_ENV ? 'hi-face-test' : 'hi-face',
  description: 'Hi头像，让头像有趣一点',
  appid: APPID_ENV ? 'wx38b49882b7761548' : 'wxd5e8989ce23206af',
  setting: {
    urlCheck: false,
    es6: false,
    postcss: false,
    minified: false
  },
  compileType: 'miniprogram',
  condition: {
    search: {
      current: -1,
      list: []
    },
    conversation: {
      current: -1,
      list: []
    },
    plugin: {
      current: -1,
      list: []
    },
    game: {
      list: []
    },
  }
}
