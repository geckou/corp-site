import { FlatCompat } from '@eslint/eslintrc'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  ...compat.extends('expo', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    languageOptions: {
      parser       : tsParser,
      ecmaVersion  : 2020,
      sourceType   : 'module',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
          jsx          : true,
        },
      },
    },
    rules: {
      'arrow-parens'                    : ['error', 'as-needed'],
      curly                             : ['error', 'multi-line'],
      'comma-dangle'                    : ['error', 'always-multiline'],
      'key-spacing'                     : [
        'error',
        {
          align: 'colon',
        },
      ],
      'no-multi-spaces': [
        'error',
        {
          exceptions: { VariableDeclarator: true },
        },
      ],
      'no-floating-decimal'             : 'off',
      'space-before-function-paren'     : ['error', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
]
