const fs = require('fs')
const path = require('path')
const projectConfig = require('./config/project.config')

const content = JSON.stringify(projectConfig)
const file = path.join(__dirname, 'project.config.json')

console.log('------------')
console.log('SERVER_ENV: ', process.env.SERVER_ENV)
console.log('APPID_ENV: ', process.env.APPID_ENV === 'test' ? '备胎' : '正式')
console.log('------------')
console.log('正在创建 project.xxxxxxxx.json...')

//写入文件
fs.writeFile(file, content, function (err) {
  if (err) {
    console.log('创建 project.config.json 失败')
    return console.log(err)
  }
  console.log('创建 project.config.json 成功')
});
