const dotenv = require('dotenv')
const path = require('path')

function loadEnv (envName) {
  try {
    const envFile = path.resolve(__dirname, '..', '..', envName)
    const envConfig = dotenv.config({ path: envFile }).parsed
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