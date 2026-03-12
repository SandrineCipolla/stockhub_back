import { expect, test } from '@playwright/test';
import { createAzureAuthHelper } from '../helpers/azureAuth';

/**
 * E2E Test Suite: Stock CRUD V2 — Full coverage
 *
 * Covers all V2 endpoints for issue #94:
 * - POST   /api/v2/stocks
 * - GET    /api/v2/stocks
 * - GET    /api/v2/stocks/:id
 * - PATCH  /api/v2/stocks/:id
 * - DELETE /api/v2/stocks/:id
 * - POST   /api/v2/stocks/:id/items
 * - GET    /api/v2/stocks/:id/items
 * - PATCH  /api/v2/stocks/:id/items/:itemId
 * - DELETE /api/v2/stocks/:id/items/:itemId
 *
 * Error scenarios:
 * - 401 Unauthorized (no token)
 * - 404 Not Found (non-existent resource)
 */

test.describe('Stock CRUD V2 — Full endpoint coverage', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3006';
  const apiV2 = `${baseURL}/api/v2`;

  let authToken: string;
  let stockId: number;
  let itemId: number;

  test.beforeAll(async () => {
    const authHelper = createAzureAuthHelper();
    authToken = await authHelper.getBearerToken();
  });

  // ─── STOCKS ──────────────────────────────────────────────────────────────────

  test('POST /stocks — crée un stock et retourne 201', async ({ request }) => {
    const response = await request.post(`${apiV2}/stocks`, {
      headers: { Authorization: authToken },
      data: {
        label: 'E2E V2 Stock',
        description: 'Stock créé par le test CRUD V2',
        category: 'test',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(typeof body.id).toBe('number');
    stockId = body.id;
  });

  test('GET /stocks — liste les stocks et contient le stock créé', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks`, {
      headers: { Authorization: authToken },
    });

    expect(response.status()).toBe(200);
    const stocks = await response.json();
    expect(Array.isArray(stocks)).toBe(true);
    const found = stocks.find((s: any) => s.id === stockId);
    expect(found).toBeDefined();
  });

  test('GET /stocks/:id — retourne le détail du stock', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks/${stockId}`, {
      headers: { Authorization: authToken },
    });

    expect(response.status()).toBe(200);
    // Le contrôleur retourne [stock] (tableau)
    const body = await response.json();
    const stock = Array.isArray(body) ? body[0] : body;
    expect(stock.id).toBe(stockId);
  });

  test('PATCH /stocks/:id — met à jour le stock et retourne 200', async ({ request }) => {
    const response = await request.patch(`${apiV2}/stocks/${stockId}`, {
      headers: { Authorization: authToken },
      data: { label: 'E2E V2 Stock Updated', description: 'Description modifiée' },
    });

    expect(response.status()).toBe(200);
  });

  // ─── ITEMS ────────────────────────────────────────────────────────────────────

  test('POST /stocks/:id/items — ajoute un item et retourne 201', async ({ request }) => {
    const response = await request.post(`${apiV2}/stocks/${stockId}/items`, {
      headers: { Authorization: authToken },
      data: {
        label: 'E2E V2 Item',
        description: 'Item créé par le test CRUD V2',
        quantity: 42,
        minimumStock: 5,
      },
    });

    expect(response.status()).toBe(201);
    // Retourne le Stock mis à jour avec ses items
    const body = await response.json();
    expect(Array.isArray(body.items)).toBe(true);
    const addedItem = body.items.find((i: any) => i.label === 'E2E V2 Item');
    expect(addedItem).toBeDefined();
    itemId = addedItem.id;
    expect(typeof itemId).toBe('number');
  });

  test('GET /stocks/:id/items — liste les items du stock', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: { Authorization: authToken },
    });

    expect(response.status()).toBe(200);
    const items = await response.json();
    expect(Array.isArray(items)).toBe(true);
    const found = items.find((i: any) => i.id === itemId);
    expect(found).toBeDefined();
    expect(found.quantity).toBe(42);
  });

  test('PATCH /stocks/:id/items/:itemId — met à jour la quantité et retourne 200', async ({
    request,
  }) => {
    const response = await request.patch(`${apiV2}/stocks/${stockId}/items/${itemId}`, {
      headers: { Authorization: authToken },
      data: { quantity: 99 },
    });

    expect(response.status()).toBe(200);
    // Retourne le Stock mis à jour — vérifier l'item dans la liste
    const body = await response.json();
    const updatedItem = body.items?.find((i: any) => i.id === itemId);
    if (updatedItem) {
      expect(updatedItem.quantity).toBe(99);
    }
  });

  test("DELETE /stocks/:id/items/:itemId — supprime l'item et retourne 204", async ({
    request,
  }) => {
    const response = await request.delete(`${apiV2}/stocks/${stockId}/items/${itemId}`, {
      headers: { Authorization: authToken },
    });

    expect(response.status()).toBe(204);

    // Vérifier que l'item n'existe plus
    const getItems = await request.get(`${apiV2}/stocks/${stockId}/items`, {
      headers: { Authorization: authToken },
    });
    const items = await getItems.json();
    expect(items.find((i: any) => i.id === itemId)).toBeUndefined();
  });

  test('DELETE /stocks/:id — supprime le stock et retourne 204', async ({ request }) => {
    const response = await request.delete(`${apiV2}/stocks/${stockId}`, {
      headers: { Authorization: authToken },
    });

    expect(response.status()).toBe(204);
  });

  // ─── SCÉNARIOS D'ERREUR ───────────────────────────────────────────────────────

  test('401 — GET /stocks sans token retourne Unauthorized', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/[Uu]nauthorized/);
  });

  test('401 — GET /stocks/:id sans token retourne Unauthorized', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks/1`);
    expect(response.status()).toBe(401);
  });

  test('404 — GET /stocks/:id inexistant retourne 404', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks/999999`, {
      headers: { Authorization: authToken },
    });
    expect(response.status()).toBe(404);
  });

  test('404 — GET /stocks/:id/items stock inexistant retourne 404', async ({ request }) => {
    const response = await request.get(`${apiV2}/stocks/999999/items`, {
      headers: { Authorization: authToken },
    });
    expect(response.status()).toBe(404);
  });
});
