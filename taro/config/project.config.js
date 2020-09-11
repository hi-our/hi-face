module.exports = {
  miniprogramRoot: './dist',
  projectname: 'hi-face',
  description: 'Hi头像，让头像有趣一点',
  appid: 'wxd5e8989ce23206af',
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
