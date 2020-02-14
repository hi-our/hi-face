const alias = require('./config/alias')

module.exports = {
  "extends": [
    "taro"
  ],
  "rules": {
    "quotes": [1, "single"],
    "quote-props": [1, "as-needed"],
    "no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "Taro"
      }
    ],
    "react/jsx-filename-extension": [
      1,
      {
        "extensions": [
          ".js",
          ".jsx",
          ".tsx"
        ]
      }
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": [
          "config/**"
        ]
      }
    ],
    "import/no-commonjs": 0,
    "import/no-named-as-default-member": 0,
    "import/prefer-default-export": 0,
    "react/jsx-boolean-value": 0,
    "import/first": 0,
    "no-unused-vars": 1,
    "jsx-quotes": 0,
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "useJSXTextNode": true,
    "project": "./tsconfig.json"
  },
  "plugins": [
    "typescript"
  ],
  "settings": {
    "import/resolver": {
      alias: {
        map: aliasListMap(alias),
        extensions: ['.ts', '.js', '.jsx', '.tsx']
      }
    }
  },
  "globals": {
    "wx": true,
    "tt": true,
    "getApp": true,
    "getCurrentPages": true,
    "SERVER_ENV": true,
  }
}

function aliasListMap(alias) {
  return Object.keys(alias).map(key => [key, alias[key]])
}
