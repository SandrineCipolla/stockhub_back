/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests/db(integration)", "<rootDir>/tests/api/routes"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    setupFiles: ["dotenv/config"],
    setupFilesAfterEnv: ["<rootDir>/tests/setupIntegrationEnv.ts"],
    testTimeout: 30000,
    verbose: true,
};
