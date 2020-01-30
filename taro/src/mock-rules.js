// mockRules.js
// Mock规则定义
const rules = {
  config: {
    query: { // 自定义query参数
      __user__: 'xiaoxili'
    },
  },
  api: [ // 对应的yapi projectid
    '/api/web', // * 匹配通配符
  ]
}

module.exports = rules