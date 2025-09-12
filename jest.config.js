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
    testMatch: [
        "**/tests/domain/**/*.test.ts"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/tests/integration/",
        "/tests/db\\(integration\\)/",
        "/tests/api/routes/"
    ],
};
