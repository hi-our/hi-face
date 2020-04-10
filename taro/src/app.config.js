export default {
  pages: [
    'pages/queen-king/queen-king',
    'pages/wear-a-mask/wear-a-mask',
    'pages/self/self',
    'pages/test/test',
    'pages/thanks/thanks',
    'pages/my-avatars/my-avatars',
    'pages/avatar-poster/avatar-poster',
    // 'pages/spread-game/spread-game',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  networkTimeout: {
    request: 20000,
    downloadFile: 10000
  },
  tabBar: {
    backgroundColor: '#fff',
    borderStyle: 'white',
    color: '#95a1af',
    selectedColor: '#2f5aff',
    list: [
      {
        pagePath: 'pages/queen-king/queen-king',
        text: '女王节',
        iconPath: 'images/tab-bar-crown.png',
        selectedIconPath: 'images/tab-bar-crown-active.png'
      },
      {
        pagePath: 'pages/wear-a-mask/wear-a-mask',
        text: '戴口罩',
        iconPath: 'images/mask-1.png',
        selectedIconPath: 'images/mask-2.png'
      },
      {
        pagePath: 'pages/self/self',
        text: '个人中心',
        iconPath: 'images/thank-1.png',
        selectedIconPath: 'images/thank-2.png'
      },

    ]
  },
}