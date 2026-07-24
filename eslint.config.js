import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        Alpine: 'readonly',
        console: 'readonly',
        CustomEvent: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        Node: 'readonly',
        globalThis: 'readonly',
        process: 'readonly',
        URL: 'readonly',
      },
    },
    files: ['src/**/*.js', 'builds/**/*.js', 'scripts/**/*.js'],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        Alpine: 'readonly',
        console: 'readonly',
        document: 'readonly',
        FormData: 'readonly',
        globalThis: 'readonly',
        process: 'readonly',
        URL: 'readonly',
      },
    },
    files: ['tests/**/*.js', 'playwright.config.js'],
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
]
