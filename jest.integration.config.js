/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests/integration"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    setupFiles: ["dotenv/config"],
    testMatch: [
        "**/tests/integration/**/*.integration.test.ts"
    ],
    setupFilesAfterEnv: ["<rootDir>/tests/setupIntegrationEnv.ts"],
    testTimeout: 60000,
    verbose: true,
};
