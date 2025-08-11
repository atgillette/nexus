const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@nexus/ui$': '<rootDir>/../../packages/ui',
    '^@nexus/database$': '<rootDir>/../../packages/database',
    '^@nexus/auth$': '<rootDir>/../../packages/auth',
    '^@nexus/types$': '<rootDir>/../../packages/types',
    '^@nexus/trpc/(.*)$': '<rootDir>/../../packages/trpc/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(superjson)/)',
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', 'test-utils'],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/layout.tsx',
    '!app/**/loading.tsx',
    '!app/**/not-found.tsx',
    '!app/**/error.tsx',
  ],
}

module.exports = createJestConfig(customJestConfig)