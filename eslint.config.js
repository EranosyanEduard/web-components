import vitest from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  { ignores: ['**/*.{js,ts}', '!**/*.test.ts'] },
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: vitest.environments.env.globals
    },
    plugins: { vitest },
    rules: vitest.configs.all.rules,
    settings: { vitest: { typecheck: true } }
  }
)
