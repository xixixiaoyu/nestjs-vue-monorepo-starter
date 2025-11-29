import { mergeConfig, type UserConfigExport } from 'vitest/config'

const coverageExclude = ['node_modules/', 'dist/', '.turbo/', '**/*.d.ts']

export const vitestBaseConfig: UserConfigExport = {
  test: {
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: coverageExclude,
    },
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    watchExclude: ['dist/**', '.turbo/**'],
  },
}

export const withVitestBaseConfig = (overrides: UserConfigExport = {}): UserConfigExport =>
  mergeConfig(vitestBaseConfig, overrides)
