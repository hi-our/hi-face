const envMode = process.env.SERVER_ENV || 'prod'
const appId = 'wxd5e8989ce23206af'

console.log('process.env.ENV_ID :>> ', process.env.ENV_ID);

if (!process.env.ENV_ID) {
  console.log('请参照 .env.example 文件，在项目根目录配置 .env 和 .env.dev 文件');
}

module.exports = {
  envMode,
  appId,
  envId: process.env.ENV_ID,
  version: '2.1.0',
}
