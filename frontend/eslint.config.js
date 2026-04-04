import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx'],
        },
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',

      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^(?:[A-Z_]|motion$)',
          argsIgnorePattern: '^[A-Z_]',
        },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
