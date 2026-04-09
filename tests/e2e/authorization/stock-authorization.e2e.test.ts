import { expect, test } from '@playwright/test';
import { createAzureAuthHelper } from '../helpers/azureAuth';

/**
 * E2E Test Suite: Stock Authorization
 *
 * This test suite validates that authorization middleware protects stock routes:
 * 1. Owner can access their own stock
 * 2. Protected routes require authentication
 * 3. Routes return proper error codes when unauthorized
 */

test.describe('Stock Authorization E2E Tests', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3006';
  const apiV2 = `${baseURL}/api/v2`;
  let authToken: string;
  let stockId: number;

  test.beforeAll(async () => {
    console.log('🚀 Starting Stock Authorization E2E Tests');

    try {
      // Get Azure AD B2C token
      const authHelper = createAzureAuthHelper();
      authToken = await authHelper.getBearerToken();
      console.log('✅ Authentication successful');
    } catch (error: any) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  });

  test('Step 1: Owner can create and access their own stock', async ({ request }) => {
    // Create a stock
    const createResponse = await request.post(`${apiV2}/stocks`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        label: 'E2E Test Stock - Authorization',
        description: 'E2E test for authorization features',
      },
    });

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    expect(created).toHaveProperty('id');
    stockId = created.id;
    console.log(`✅ Stock created (ID: ${stockId})`);

    // Owner should be able to access stock items (this is a protected route)
    const getItemsResponse = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    });

    expect(getItemsResponse.status()).toBe(200);
    const items = await getItemsResponse.json();
    expect(Array.isArray(items)).toBe(true);
    console.log('✅ Owner can access their stock items (authorization passed)');
  });

  test('Step 2: Protected routes require authentication', async ({ request }) => {
    // Try to access stock without authentication
    const response = await request.get(`${apiV2}/stocks/1`);

    expect(response.status()).toBe(401);
    const error = await response.json();
    expect(error.error).toContain('Unauthorized');
    console.log('✅ Unauthenticated request correctly rejected with 401');
  });

  test('Step 3: Owner can add items to their stock (write operation)', async ({ request }) => {
    const addItemResponse = await request.post(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        label: 'Authorization Test Item',
        description: 'Item for testing authorization',
        quantity: 10,
        minimumStock: 2,
      },
    });

    expect(addItemResponse.status()).toBe(201);
    const result = await addItemResponse.json();
    expect(result).toHaveProperty('id');
    console.log('✅ Owner can add items to their stock');
  });

  test('Step 4: Owner can update items in their stock (write operation)', async ({ request }) => {
    // Get the item we just created
    const getItemsResponse = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    });

    const items = await getItemsResponse.json();
    const testItem = items.find((i: any) => i.label === 'Authorization Test Item');
    expect(testItem).toBeDefined();

    const itemId = testItem.id;

    // Update the item quantity
    const updateResponse = await request.patch(`${apiV2}/stocks/${stockId}/items/${itemId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: {
        quantity: 20,
      },
    });

    expect(updateResponse.status()).toBe(200);
    const result = await updateResponse.json();
    expect(result).toHaveProperty('id');
    console.log('✅ Owner can update items in their stock');
  });

  test.afterAll(async ({ request }) => {
    // Cleanup: delete the test stock
    if (stockId) {
      try {
        await request.delete(`${apiV2}/stocks/${stockId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
        });
        console.log('✅ Test stock cleaned up');
      } catch (error: any) {
        console.warn(`⚠️  Error deleting test stock: ${error.message}`);
      }
    }
  });
});
