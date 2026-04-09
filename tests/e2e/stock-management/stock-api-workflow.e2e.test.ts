import { expect, test } from '@playwright/test';
import { createAzureAuthHelper } from '../helpers/azureAuth';

/**
 * API E2E Test Suite: Stock Management Complete Workflow
 *
 * These tests validate the backend API end-to-end with real Azure AD B2C authentication.
 * They simulate how a client (React frontend, mobile app) would call the API.
 *
 * IMPORTANT: These tests were created before Frontend V2 integration (2026-01-07).
 * They test the API layer only, not the user interface.
 *
 * Workflow tested:
 * 1. Authenticate with Azure AD B2C to get real token
 * 2. Create a new stock
 * 3. Add items to the stock
 * 4. Visualize the stock and its items
 * 5. Update item quantities
 * 6. Check for low stock items
 *
 * For full E2E tests including React UI, see:
 * - Future issue: Full E2E tests with frontend + backend
 * - Repository: stockHub_V2_front/tests/e2e-full/
 */

test.describe('Stock Management API E2E Workflow with Azure AD', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3006';
  const apiV2 = `${baseURL}/api/v2`;
  let stockId: number;
  let itemId1: number;
  let authToken: string;
  const createdStockIds: number[] = []; // Track all created stocks for cleanup

  test.beforeAll(async () => {
    console.log('🚀 Starting E2E Stock Management Tests');

    try {
      // Get Azure AD B2C token using MSAL helper
      const authHelper = createAzureAuthHelper();
      authToken = await authHelper.getBearerToken();
      console.log('✅ Authentication successful');
    } catch (error: any) {
      console.error('❌ Authentication failed:', error.message);
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Verify .env.test has all required Azure credentials');
      console.log('2. Check that your B2C policy supports ROPC');
      console.log('3. Ensure "Allow public client flows" is enabled in Azure Portal');
      throw error;
    }
  });

  test('Step 1: Create a new stock with Azure AD authentication', async ({ request }) => {
    const response = await request.post(`${apiV2}/stocks`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        label: 'E2E Test Stock with Azure AD',
        description: 'Stock created via E2E test with real Azure AD authentication',
      },
    });

    expect(response.status()).toBe(201);
    const result = await response.json();

    expect(result).toHaveProperty('id');
    stockId = result.id;

    console.log(`✅ Stock created (ID: ${stockId}`);

    // Track the created stock for cleanup
    createdStockIds.push(stockId);
  });

  test('Step 2: Add first item to stock (normal stock)', async ({ request }) => {
    const response = await request.post(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        label: 'Pommes Bio',
        description: 'Pommes rouges biologiques',
        quantity: 50,
        minimumStock: 10,
      },
    });

    expect(response.status()).toBe(201);
    const result = await response.json();

    expect(result).toHaveProperty('id');
    itemId1 = result.id;
  });

  test('Step 3: Add second item to stock (low stock)', async ({ request }) => {
    const response = await request.post(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        label: 'Bananes',
        description: 'Bananes équitables',
        quantity: 5,
        minimumStock: 20,
      },
    });

    expect(response.status()).toBe(201);
    const result = await response.json();

    expect(result).toHaveProperty('id');
  });

  test('Step 4: Visualize stock and verify items', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {},
    });

    expect(response.status()).toBe(200);
    const items = await response.json();

    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(2);

    const apple = items.find((item: any) => item.label === 'Pommes Bio');
    const banana = items.find((item: any) => item.label === 'Bananes');

    expect(apple).toBeDefined();
    expect(banana).toBeDefined();

    expect(apple.quantity).toBe(50);
    expect(banana.quantity).toBe(5);
  });

  test('Step 5: Update item quantity', async ({ request }) => {
    const response = await request.patch(`${apiV2}/stocks/${stockId}/items/${itemId1}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        quantity: 75,
      },
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result).toHaveProperty('id');

    // Verify the update
    const getItemsResponse = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {},
    });

    const items = await getItemsResponse.json();
    const updatedApple = items.find((item: any) => item.id === itemId1);
    expect(updatedApple.quantity).toBe(75);
  });

  test('Step 6: Check for low stock items', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {},
    });

    expect(response.status()).toBe(200);
    const items = await response.json();

    expect(Array.isArray(items)).toBe(true);

    const lowStockBanana = items.find(
      (item: any) => item.label === 'Bananes' && item.status === 'low'
    );

    expect(lowStockBanana).toBeDefined();
    expect(lowStockBanana.quantity).toBe(5);
    expect(lowStockBanana.minimumStock).toBe(20);
  });

  test.afterAll(async ({ request }) => {
    // Delete all created stocks
    for (const id of createdStockIds) {
      try {
        await request.delete(`${apiV2}/stocks/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
        });
      } catch (error: any) {
        console.warn(`⚠️  Error deleting test stock ${id}:`, error.message);
      }
    }

    console.log('✅ E2E tests completed and cleaned up');
  });
});
