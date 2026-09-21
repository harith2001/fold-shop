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
  rules: {
    'vue/no-v-html': 'error',
    'vue/require-prop-types': 'error',
    'vue/require-default-prop': 'error'
  },
  overrides: [
    {
      files: ['tests/**/*.spec.{ts,tsx}', 'tests/setup.ts'],
      env: {
        jest: true
      }
    }
  ]
};
