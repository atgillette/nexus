const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@nexus/ui$': '<rootDir>/../../packages/ui',
    '^@nexus/database$': '<rootDir>/../../packages/database',
    '^@nexus/auth$': '<rootDir>/../../packages/auth',
    '^@nexus/types$': '<rootDir>/../../packages/types',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
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