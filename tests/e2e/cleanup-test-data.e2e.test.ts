import {test} from '@playwright/test';
import {createAzureAuthHelper} from './helpers/azureAuth';

/**
 * E2E Test: Clean up old test data
 *
 * This test removes all old E2E test stocks from the database to ensure a clean slate
 */

test.describe('Cleanup old test data', () => {
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3006';
    const apiV1 = `${baseURL}/api/v1`;
    const apiV2 = `${baseURL}/api/v2`;
    let authToken: string;

    test.beforeAll(async () => {
        console.log('🔐 Authenticating with Azure AD B2C...');
        const authHelper = createAzureAuthHelper();
        authToken = await authHelper.getBearerToken();
        console.log('✅ Authentication successful!');
    });

    test('Clean up all E2E test stocks', async ({request}) => {
        console.log('📋 Fetching all stocks...');

        const getAllResponse = await request.get(`${apiV2}/stocks`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            }
        });

        const stocks = await getAllResponse.json();
        console.log(`Found ${stocks.length} total stocks`);

        // Filter test stocks
        const testStocks = stocks.filter((s: any) =>
            s.label === 'E2E Test Stock with Azure AD' ||
            s.description?.includes('E2E test')
        );

        console.log(`Found ${testStocks.length} test stocks to delete`);

        if (testStocks.length === 0) {
            console.log('✅ No test stocks to clean up');
            return;
        }

        // Delete each test stock
        for (const stock of testStocks) {
            const deleteResponse = await request.delete(`${apiV1}/stocks/${stock.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                }
            });

            if (deleteResponse.status() === 200 || deleteResponse.status() === 204) {
                console.log(`✅ Deleted stock ${stock.id}: ${stock.label}`);
            } else {
                console.warn(`⚠️  Failed to delete stock ${stock.id} - Status: ${deleteResponse.status()}`);
            }
        }

        console.log('🏁 Cleanup completed');
    });
});
