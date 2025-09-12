/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests/db(integration)", "<rootDir>/tests/api/routes"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    setupFiles: ["dotenv/config"],
    testMatch: [
        "**/tests/integration/**/*.test.ts",
        "**/tests/db(integration)/**/*.test.ts",
        "**/tests/api/routes/**/*.test.ts"
    ],
    setupFilesAfterEnv: ["<rootDir>/tests/setupIntegrationEnv.ts"],
    testTimeout: 30000,
    verbose: true,
};
