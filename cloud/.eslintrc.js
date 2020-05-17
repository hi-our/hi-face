module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "standard",
    "plugin:promise/recommended",
    "plugin:import/recommended"
  ],
  "env": {
    "browser": true,
    "es6": true
  },
  "rules": {
    "import/no-absolute-path": 2,
    "import/no-extraneous-dependencies": 2,
    "import/no-mutable-exports": 2,
    "import/newline-after-import": 1,
    "import/unambiguous": 0,
    "import/no-unresolved": [2, { "ignore": ["^utils", "^constants", "^config", "^mixins"] }],
    "no-unneeded-ternary": "off",
    "promise/no-nesting": 0,
    "promise/catch-or-return": 0,
    "promise/avoid-new": 0,
    "promise/no-callback-in-promise": 0,
    "promise/always-return": 0,
    "prefer-promise-reject-errors": [0, {
      "allowEmptyReject": true
    }],

    "no-extend-native": [
      "error",
      {
        "exceptions": ["Promise", "String"]
      }
    ],
    "semi": [1],
    "comma-dangle": 0,
    "padded-blocks": 0,
    "space-before-function-paren": [1, {
      "anonymous": "always",
      "named": "never"
    }],
    "max-len": [1, {
      "code": 100,
      "tabWidth": 2,
      "ignoreComments": true,
      "ignoreStrings": true,
      "ignoreUrls": true,
      "ignoreRegExpLiterals": true,
    }],
    "brace-style": 0,
    "operator-linebreak": [1, "after"],
    "camelcase": 0,
    "no-multiple-empty-lines": [1, {
      "max": 2
    }],
    "no-unused-vars": [1, {
      "vars": "all",
      "args": "after-used",
      "caughtErrors": "none",
      "ignoreRestSiblings": true
    }],
    "no-unused-expressions": "off",
    "spaced-comment": 0
  },
  "globals": {
    "App": true,
    "Page": true,
    "Component": true,
    "wx": true,
    "getApp": true,
    "getCurrentPages": true
  }
}