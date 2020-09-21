export default {
  pages: [
    'pages/avatar-edit/avatar-edit',
    // 'pages/image-watermark/image-watermark',
    // 'pages/detect-face/detect-face',
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
  sitemapLocation: "sitemap.json",
  tabBar: {
    backgroundColor: '#fff',
    borderStyle: 'white',
    color: '#95a1af',
    selectedColor: '#2f5aff',
    list: [
      {
        pagePath: 'pages/avatar-edit/avatar-edit',
        text: '头像编辑',
        iconPath: 'images/tab-bar-crown.png',
        selectedIconPath: 'images/tab-bar-crown-active.png'
      },
      // {
      //   pagePath: 'pages/detect-face/detect-face',
      //   text: '人像魅力',
      //   iconPath: 'images/face-1.png',
      //   selectedIconPath: 'images/face-1-active.png'
      // },
      // {
      //   pagePath: 'pages/wear-a-mask/wear-a-mask',
      //   text: '戴口罩',
      //   iconPath: 'images/mask-1.png',
      //   selectedIconPath: 'images/mask-2.png'
      // },
      // {
      //   pagePath: 'pages/self/self',
      //   text: '个人中心',
      //   iconPath: 'images/thank-1.png',
      //   selectedIconPath: 'images/thank-2.png'
      // },
      {
        pagePath: 'pages/thanks/thanks',
        text: '致谢',
        iconPath: 'images/thank-1.png',
        selectedIconPath: 'images/thank-2.png'
      },

    ]
  },
}