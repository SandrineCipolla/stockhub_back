import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Stock Management Complete Workflow
 *
 * This test suite validates the complete stock management workflow using v1 API:
 * 1. Create a new stock
 * 2. Add items to the stock
 * 3. Visualize the stock and its items
 * 4. Update item quantities
 * 5. Check for low stock items
 */

test.describe('Stock Management E2E Workflow', () => {
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3006';
    const apiV1 = `${baseURL}/api/v1`;
    let stockId: number;
    let itemId1: number;
    let itemId2: number;

    // Mock Azure AD authentication
    const mockUserOID = 'test-user-oid-e2e-12345';

    test.beforeAll(async () => {
        console.log('🚀 Starting E2E Stock Management Tests');
        console.log(`📍 API Base URL: ${baseURL}`);
        console.log(`📍 API v1: ${apiV1}`);
    });

    test('Step 1: Create a new stock', async ({ request }) => {
        const response = await request.post(`${apiV1}/stocks`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID,
                LABEL: 'E2E Test Stock',
                DESCRIPTION: 'Stock created via E2E test with Playwright'
            }
        });

        expect(response.status()).toBe(201);
        const result = await response.json();

        expect(result).toHaveProperty('message');
        expect(result.message).toContain('Stock created successfully');

        console.log(`✅ Stock created successfully`);

        // Get the stock ID by fetching all stocks
        const getAllResponse = await request.get(`${apiV1}/stocks`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID
            }
        });

        const stocks = await getAllResponse.json();
        const createdStock = stocks.find((s: any) => s.LABEL === 'E2E Test Stock');
        stockId = createdStock.ID;
        console.log(`📦 Stock ID: ${stockId}`);
    });

    test('Step 2: Add first item to stock (normal stock)', async ({ request }) => {
        const response = await request.post(`${baseURL}/stocks/${stockId}/items`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID,
                LABEL: 'Pommes Bio',
                DESCRIPTION: 'Pommes rouges biologiques',
                QUANTITY: 50,
                MINIMUM_STOCK: 10
            }
        });

        expect(response.status()).toBe(201);
        const result = await response.json();

        expect(result).toHaveProperty('message');
        expect(result.message).toContain('Item added successfully');

        console.log(`✅ First item (Pommes) added successfully`);

        // Get item ID
        const getItemsResponse = await request.get(`${baseURL}/stocks/${stockId}/items`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID
            }
        });

        const items = await getItemsResponse.json();
        const apple = items.find((item: any) => item.LABEL === 'Pommes Bio');
        itemId1 = apple.ID;
        console.log(`🍎 Item ID 1: ${itemId1}`);
    });

    test('Step 3: Add second item to stock (low stock)', async ({ request }) => {
        const response = await request.post(`${baseURL}/stocks/${stockId}/items`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID,
                LABEL: 'Bananes Équitables',
                DESCRIPTION: 'Bananes issues du commerce équitable',
                QUANTITY: 5,
                MINIMUM_STOCK: 20
            }
        });

        expect(response.status()).toBe(201);
        const result = await response.json();

        expect(result).toHaveProperty('message');
        expect(result.message).toContain('Item added successfully');

        console.log(`✅ Second item (Bananes) added successfully`);

        // Get item ID
        const getItemsResponse = await request.get(`${baseURL}/stocks/${stockId}/items`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID
            }
        });

        const items = await getItemsResponse.json();
        const banana = items.find((item: any) => item.LABEL === 'Bananes Équitables');
        itemId2 = banana.ID;
        console.log(`🍌 Item ID 2: ${itemId2}`);
    });

    test('Step 4: Visualize all stocks', async ({ request }) => {
        const response = await request.get(`${baseURL}/stocks`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID
            }
        });

        expect(response.status()).toBe(200);
        const stocks = await response.json();

        expect(Array.isArray(stocks)).toBe(true);
        expect(stocks.length).toBeGreaterThan(0);

        const ourStock = stocks.find((s: any) => s.ID === stockId);
        expect(ourStock).toBeDefined();
        expect(ourStock.LABEL).toBe('E2E Test Stock');

        console.log(`✅ Retrieved ${stocks.length} stock(s)`);
    });

    test('Step 5: Visualize specific stock details', async ({ request }) => {
        const response = await request.get(`${baseURL}/stocks/${stockId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID
            }
        });

        expect(response.status()).toBe(200);
        const stock = await response.json();

        expect(stock[0].ID).toBe(stockId);
        expect(stock[0].LABEL).toBe('E2E Test Stock');

        console.log(`✅ Stock details retrieved`);
    });

    test('Step 6: Visualize stock items', async ({ request }) => {
        const response = await request.get(`${baseURL}/stocks/${stockId}/items`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID
            }
        });

        expect(response.status()).toBe(200);
        const items = await response.json();

        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(2);

        const apple = items.find((item: any) => item.ID === itemId1);
        expect(apple.LABEL).toBe('Pommes Bio');
        expect(apple.QUANTITY).toBe(50);

        const banana = items.find((item: any) => item.ID === itemId2);
        expect(banana.LABEL).toBe('Bananes Équitables');
        expect(banana.QUANTITY).toBe(5);

        console.log(`✅ Retrieved ${items.length} items from stock`);
    });

    test('Step 7: Update item quantity (increase apples)', async ({ request }) => {
        const response = await request.put(`${baseURL}/stocks/${stockId}/items/${itemId1}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID,
                QUANTITY: 100
            }
        });

        expect(response.status()).toBe(200);
        const result = await response.json();

        expect(result).toHaveProperty('message');
        expect(result.message).toContain('updated successfully');

        console.log(`✅ Item ${itemId1} (Pommes) quantity updated to 100`);
    });

    test('Step 8: Update item quantity (decrease bananas to critical level)', async ({ request }) => {
        const response = await request.put(`${baseURL}/stocks/${stockId}/items/${itemId2}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID,
                QUANTITY: 3
            }
        });

        expect(response.status()).toBe(200);
        const result = await response.json();

        expect(result).toHaveProperty('message');
        expect(result.message).toContain('updated successfully');

        console.log(`✅ Item ${itemId2} (Bananes) quantity updated to 3 (critical low stock)`);
    });

    test('Step 9: Check for low stock items', async ({ request }) => {
        const response = await request.get(`${baseURL}/low-stock-items`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                userID: mockUserOID
            }
        });

        expect(response.status()).toBe(200);
        const lowStockItems = await response.json();

        expect(Array.isArray(lowStockItems)).toBe(true);
        expect(lowStockItems.length).toBeGreaterThan(0);

        // Bananas should be in low stock (quantity: 3, MINIMUM_STOCK: 20)
        const banana = lowStockItems.find((item: any) => item.ID === itemId2);
        expect(banana).toBeDefined();
        expect(banana.LABEL).toBe('Bananes Équitables');
        expect(banana.QUANTITY).toBe(3);
        expect(banana.MINIMUM_STOCK).toBe(20);

        // Apples should NOT be in low stock (quantity: 100, MINIMUM_STOCK: 10)
        const apple = lowStockItems.find((item: any) => item.ID === itemId1);
        expect(apple).toBeUndefined();

        console.log(`✅ Found ${lowStockItems.length} low stock item(s)`);
        console.log(`🚨 Low stock items:`, lowStockItems.map((item: any) => ({
            label: item.LABEL,
            quantity: item.QUANTITY,
            minimum: item.MINIMUM_STOCK
        })));
    });

    test.afterAll(async () => {
        console.log('🏁 E2E tests completed successfully!');
        console.log('💡 Tip: To clean up test data, manually delete test stock via DELETE /stocks/:ID');
    });
});
