import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist', 'node_modules', 'server', 'scratch', 'temp.txt'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        Image: 'readonly',
        Audio: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      // TypeScript rules
      ...typescriptPlugin.configs.recommended.rules,
      
      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Custom adjustments
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }]
    },
  },
];
