module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
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
