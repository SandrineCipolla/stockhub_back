module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
    },
    moduleNameMapper: {
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
        '^@utils/(.*)$': '<rootDir>/src/Utils/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@api/(.*)$': '<rootDir>/src/api/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    setupFiles: ['dotenv/config'],
    testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx)'],
    testPathIgnorePatterns: ['<rootDir>/tests/integration'],

    // Coverage
    collectCoverage: process.env.COVERAGE === 'true', // Active la couverture seulement si une variable d'environnement est définie
    coverageDirectory: './coverage',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts', // Inclure tous les fichiers TypeScript dans `src`
        '!<rootDir>/tests/**', // Exclure les tests d'intégration
        '!<rootDir>/src/**/*.d.ts', // Exclure les fichiers de types (déclaration .d.ts)
    ],
};
