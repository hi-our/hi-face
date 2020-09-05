const dotenv = require('dotenv')
const fs = require('fs')

// load .env file and merge
console.log('process.env.SERVER_ENV :>> ', process.env.SERVER_ENV === 'dev');
function loadEnv () {
  try {
    fs.accessSync(process.env.SERVER_ENV === 'dev' ? '../.env.dev' : '../.env', fs.constants.F_OK)

    const envConfig = dotenv.parse(fs.readFileSync('.env'))
    for (let k in envConfig) {
      if (!process.env[k]) {
        process.env[k] = envConfig[k]
      }
    }
  } catch (e) {
    console.log('e :>> ', e);
  }
}

module.exports = loadEnv