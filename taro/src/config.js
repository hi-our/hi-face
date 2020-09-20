const envMode = process.env.SERVER_ENV || 'prod'

console.log('当前云环境ID :>> ', process.env.APP_ID, process.env.ENV_ID);

if (!process.env.APP_ID) {
  console.log('请参照 .env.example 文件，在项目根目录配置 .env 和 .env.dev 文件');
}

module.exports = {
  envMode,
  appId: process.env.APP_ID,
  envId: process.env.ENV_ID,
  version: '2.2.3',
}
