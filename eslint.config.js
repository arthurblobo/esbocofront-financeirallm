import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['src/lib/data.ts', 'src/mocks/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/mocks/*', '**/mocks/*', 'mocks/*'],
          message: 'Access mock data through src/lib/data.ts.',
        }],
      }],
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
)
