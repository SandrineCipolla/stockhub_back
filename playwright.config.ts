import {defineConfig} from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test for E2E tests
dotenv.config({path: path.resolve(__dirname, '.env.test')});

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: 'html',

    use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3006',
        trace: 'retain-on-failure',
        extraHTTPHeaders: {
            // Authorization sera ajouté dynamiquement dans beforeAll
        },
    },

    projects: [
        {
            name: 'API Tests',
        },
    ],
});
