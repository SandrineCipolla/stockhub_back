module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@utils/(.*)$': '<rootDir>/src/Utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@authentication/(.*)$': '<rootDir>/src/authentication/$1',
    '^@authorization/(.*)$': '<rootDir>/src/authorization/$1',
    '^@serverSetup/(.*)$': '<rootDir>/src/serverSetup/$1',
    '^@core/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  setupFiles: ['dotenv/config'],
  testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/integration',
    '<rootDir>/tests/e2e',
    '<rootDir>/tests/api/routes',
  ],

  // Coverage
  collectCoverage: process.env.COVERAGE === 'true', // Active la couverture seulement si une variable d'environnement est définie
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    '<rootDir>/src/domain/**/*.ts',
    '<rootDir>/src/api/controllers/**/*.ts',
    '!<rootDir>/src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 65,
      functions: 90,
      lines: 85,
    },
  },
};
