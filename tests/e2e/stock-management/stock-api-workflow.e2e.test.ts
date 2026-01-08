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
  const apiV1 = `${baseURL}/api/v1`; // Used for POST/PUT (creation/modification)
  const apiV2 = `${baseURL}/api/v2`; // Used for GET (reading)
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
    const response = await request.post(`${apiV1}/stocks`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        LABEL: 'E2E Test Stock with Azure AD',
        DESCRIPTION: 'Stock created via E2E test with real Azure AD authentication',
      },
    });

    expect(response.status()).toBe(201);
    const result = await response.json();

    expect(result).toHaveProperty('message');
    expect(result.message).toContain('Stock created successfully');

    // Extract stock ID from response if available, otherwise fetch from GET endpoint
    if (result.stock && result.stock.ID) {
      stockId = result.stock.ID;
    } else {
      // Get the stock ID by fetching all stocks (using v2 GET endpoint)
      const getAllResponse = await request.get(`${apiV2}/stocks`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
      });

      expect(getAllResponse.status()).toBe(200);
      const stocks = await getAllResponse.json();
      const createdStock = stocks.find((s: any) => s.label === 'E2E Test Stock with Azure AD');
      expect(createdStock).toBeDefined();
      stockId = createdStock.id;
    }

    console.log(`✅ Stock created (ID: ${stockId}`);

    // Track the created stock for cleanup
    createdStockIds.push(stockId);
  });

  test('Step 2: Add first item to stock (normal stock)', async ({ request }) => {
    const response = await request.post(`${apiV1}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        LABEL: 'Pommes Bio',
        DESCRIPTION: 'Pommes rouges biologiques',
        QUANTITY: 50,
        MINIMUM_STOCK: 10,
      },
    });

    expect(response.status()).toBe(201);
    const result = await response.json();

    expect(result).toHaveProperty('message');
    expect(result.message).toContain('added successfully');

    // Get item ID
    const getItemsResponse = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {},
    });

    const items = await getItemsResponse.json();
    // V2 returns lowercase field names
    const apple = items.find((item: any) => (item.label || item.LABEL) === 'Pommes Bio');
    itemId1 = apple.id || apple.ID;
  });

  test('Step 3: Add second item to stock (low stock)', async ({ request }) => {
    const response = await request.post(`${apiV1}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        LABEL: 'Bananes',
        DESCRIPTION: 'Bananes équitables',
        QUANTITY: 5,
        MINIMUM_STOCK: 20,
      },
    });

    expect(response.status()).toBe(201);
    const result = await response.json();

    expect(result).toHaveProperty('message');
    expect(result.message).toContain('added successfully');

    // Get item ID
    const getItemsResponse = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {},
    });

    const items = await getItemsResponse.json();
    // V2 returns lowercase field names
    items.find((item: any) => (item.label || item.LABEL) === 'Bananes');
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

    // V2 returns lowercase field names
    const apple = items.find((item: any) => (item.label || item.LABEL) === 'Pommes Bio');
    const banana = items.find((item: any) => (item.label || item.LABEL) === 'Bananes');

    expect(apple).toBeDefined();
    expect(banana).toBeDefined();

    const appleQty = apple.quantity || apple.QUANTITY;
    const bananaQty = banana.quantity || banana.QUANTITY;

    expect(appleQty).toBe(50);
    expect(bananaQty).toBe(5);
  });

  test('Step 5: Update item quantity', async ({ request }) => {
    const response = await request.put(`${apiV1}/stocks/${stockId}/items/${itemId1}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        QUANTITY: 75,
      },
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result).toHaveProperty('message');
    expect(result.message).toContain('updated successfully');

    // Verify the update
    const getItemResponse = await request.get(`${apiV1}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {},
    });

    const items = await getItemResponse.json();
    // V2 returns lowercase field names
    const updatedApple = items.find((item: any) => (item.id || item.ID) === itemId1);
    const updatedQty = updatedApple.quantity || updatedApple.QUANTITY;
    expect(updatedQty).toBe(75);
  });

  test('Step 6: Check for low stock items', async ({ request }) => {
    const response = await request.get(`${apiV1}/low-stock-items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {},
    });

    expect(response.status()).toBe(200);
    const lowStockItems = await response.json();

    expect(Array.isArray(lowStockItems)).toBe(true);
    expect(lowStockItems.length).toBeGreaterThan(0);

    const lowStockBanana = lowStockItems.find(
      (item: any) => item.LABEL === 'Bananes' && item.QUANTITY < item.MINIMUM_STOCK
    );

    expect(lowStockBanana).toBeDefined();
    expect(lowStockBanana.QUANTITY).toBe(5);
    expect(lowStockBanana.MINIMUM_STOCK).toBe(20);
  });

  test.afterAll(async ({ request }) => {
    // Delete all created stocks
    for (const id of createdStockIds) {
      try {
        await request.delete(`${apiV1}/stocks/${id}`, {
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
