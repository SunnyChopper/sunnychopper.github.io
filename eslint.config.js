import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
const customRules = require(join(__dirname, 'eslint-rules', 'custom-rules.cjs'))

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage', '.husky']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      sonarjs,
      unicorn,
      custom: { rules: customRules.rules },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/display-name': 'warn',

      // Import rules
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-unused-modules': 'warn',
      'import/no-duplicates': 'error',

      // JSX A11y rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',

      // SonarJS rules
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-small-switch': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-object-literal': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',

      // Unicorn rules
      'unicorn/filename-case': [
        'warn',
        {
          case: 'kebabCase',
          ignore: [/^[A-Z]/, /\.config\.(js|ts)$/],
        },
      ],
      'unicorn/no-array-callback-reference': 'warn',
      'unicorn/no-array-for-each': 'off', // Allow forEach for side effects
      'unicorn/no-array-reduce': 'warn',
      'unicorn/prefer-array-find': 'warn',
      'unicorn/prefer-array-some': 'warn',
      'unicorn/prefer-includes': 'warn',
      'unicorn/prefer-string-starts-ends-with': 'warn',
      'unicorn/prefer-module': 'off', // ESM is used
      'unicorn/prefer-node-protocol': 'warn',
      'unicorn/prevent-abbreviations': 'off', // Too strict for this project

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Too strict

      // Custom project rules
      'custom/service-returns-api-response': 'warn',
      'custom/no-inline-styles': 'warn',
      'custom/component-has-state-handling': 'warn',
    },
  },
])
