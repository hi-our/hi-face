const dotenv = require('dotenv')
const fs = require('fs')

// load .env file and merge
function loadEnv () {
  try {
    fs.accessSync('.env', fs.constants.F_OK)

    const envConfig = dotenv.parse(fs.readFileSync('.env'))
    for (let k in envConfig) {
      if (!process.env[k]) {
        process.env[k] = envConfig[k]
      }
    }
  } catch (e) {}
}

module.exports = loadEnv