import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    settings: {
      node: {
        allowModules: ['jest-playwright-preset', 'wait-on'],
        tryExtensions: ['.ts', '.json', '.node'],
      },
    },
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },
  eslintConfigPrettier,
);
