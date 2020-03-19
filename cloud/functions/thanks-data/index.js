// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const data = {
  thanksWord: '感谢我家小雪的默默支持及照顾。\n感谢老娘舅群小伙伴的支持，包括范老师、苏老师、拉总、俊总。\n感谢公司小伙伴的支持，包括华翔、Coco。',
  authorAvatar: 'https://n1image.hjfile.cn/res7/2020/02/02/19ad178fc9dc54eca7b050a6ad3077d0.jpg',
  authorName: '小溪里',
  authorDesc: 'Blog: xiaoxili.com\nEmail: shenghanqin@163.com\nGitHub: github.com/shenghanqin',
  sourceLink: 'https://github.com/shenghanqin/quickly-mask',
  referenceList: [
    {
      image: 'https://n1image.hjfile.cn/res7/2020/02/04/d6fec5814eb7f6d5f058942ca5e5f9b6.png',
      desc: 'Taro 多端统一开发解决方案\ntaro.aotu.io\n快速开发多端小程序的必选框架'
    },
    {
      image: 'https://n1image.hjfile.cn/res7/2020/02/02/8d095d49ed4ca2810c1a9871d39499bc.png',
      desc: '我要戴口罩\ngithub.com/idealclover/Wear-A-Mask\n参考了口罩的主要逻辑'
    },
    {
      image: 'https://n1image.hjfile.cn/res7/2020/02/02/35b5870e5b67c40a525aa621122d4041.png',
      desc: '网页App：christmas-hat\nwww.hksite.cn/prjs/christmashat/\n使用face-api.js识别人脸五官，自动戴圣诞帽'
    },
    {
      image: 'https://n1image.hjfile.cn/res7/2020/02/02/ccd45906455ce7023d4a04922d92a281.png',
      desc: '腾讯云：人脸识别五官分析\ncloud.tencent.com/product/facerecognition'
    }
  ]

}

// 云函数入口函数
exports.main = async (event, context) => {
  const { testData = '' } = event
  if (testData) {
    console.log('testData :', testData)
    console.log('testData大小为 :', testData.length / 1024 + 'k');
  }
  return {
    data,
    time: new Date(),
    status: 0,
    message: ''
  }
}