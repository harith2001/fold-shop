module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {},
  overrides: [
    {
      files: ['tests/**/*.spec.ts'],
      env: {
        jest: true
      }
    }
  ]
};
