/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests/integration"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    moduleNameMapper: {
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
        '^@utils/(.*)$': '<rootDir>/src/Utils/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@api/(.*)$': '<rootDir>/src/api/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@authentication/(.*)$': '<rootDir>/src/authentication/$1',
        '^@serverSetup/(.*)$': '<rootDir>/src/serverSetup/$1',
        '^@core/(.*)$': '<rootDir>/src/$1',
    },
    setupFiles: ["dotenv/config"],
    testMatch: [
        "**/tests/integration/**/*.integration.test.ts"
    ],
    setupFilesAfterEnv: ["<rootDir>/tests/setupIntegrationEnv.ts"],
    testTimeout: 60000,
    verbose: true,
};
