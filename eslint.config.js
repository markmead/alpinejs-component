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
        CSSImportRule: 'readonly',
        CSSStyleRule: 'readonly',
        CSSStyleSheet: 'readonly',
        CustomEvent: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        Node: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        window: 'readonly',
      },
    },
    files: ['src/**/*.js', 'builds/**/*.js', 'scripts/**/*.js'],
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]
