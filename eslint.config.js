import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['coverage/', 'node_modules/', 'dist/', 'test/*.test.js'],
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
]
