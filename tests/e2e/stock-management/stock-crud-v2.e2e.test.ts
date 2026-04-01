import { test as it, expect } from '@playwright/test';
import { createAzureAuthHelper } from '../helpers/azureAuth';

const { describe } = it;

/**
 * API Integration Tests: Stock CRUD V2 — Full endpoint coverage
 *
 * Note: Ces tests sont des tests d'intégration API (HTTP client → Backend → DB).
 * Le vrai E2E UI (navigateur → Frontend → Backend) est suivi dans l'issue #66.
 *
 * Endpoints couverts :
 * - POST/GET/PATCH/DELETE /api/v2/stocks
 * - POST/GET/PATCH/DELETE /api/v2/stocks/:id/items
 * - Scénarios d'erreur : 401 (sans token), 404 (ressource inexistante)
 */

describe('Stock API V2', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3006';
  const apiV2 = `${baseURL}/api/v2`;

  let authToken: string;
  let stockId: number;
  let itemId: number;

  it.beforeAll(async () => {
    const authHelper = createAzureAuthHelper();
    authToken = await authHelper.getBearerToken();
  });

  // ─── STOCKS ────────────────────────────────────────────────────────────────

  describe('POST /stocks', () => {
    describe('when authenticated', () => {
      it('creates a stock and returns 201', async ({ request }) => {
        const response = await request.post(`${apiV2}/stocks`, {
          headers: { Authorization: authToken },
          data: {
            label: 'E2E V2 Stock',
            description: 'Stock créé par le test API V2',
            category: 'alimentation',
          },
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(typeof body.id).toBe('number');
        stockId = body.id;
      });
    });

    describe('when not authenticated', () => {
      it('returns 401 Unauthorized', async ({ request }) => {
        const response = await request.post(`${apiV2}/stocks`, {
          data: { label: 'No Auth Stock', category: 'alimentation' },
        });
        expect(response.status()).toBe(401);
      });
    });
  });

  describe('GET /stocks', () => {
    describe('when authenticated', () => {
      it('returns the list of stocks and includes the created stock', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks`, {
          headers: { Authorization: authToken },
        });

        expect(response.status()).toBe(200);
        const stocks = await response.json();
        expect(Array.isArray(stocks)).toBe(true);
        expect(stocks.find((s: any) => s.id === stockId)).toBeDefined();
      });
    });

    describe('when not authenticated', () => {
      it('returns 401 Unauthorized', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks`);
        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.error).toMatch(/[Uu]nauthorized/);
      });
    });
  });

  describe('GET /stocks/:id', () => {
    describe('when authenticated and stock exists', () => {
      it('returns the stock details', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks/${stockId}`, {
          headers: { Authorization: authToken },
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        const stock = Array.isArray(body) ? body[0] : body;
        expect(stock.id).toBe(stockId);
      });
    });

    describe('when not authenticated', () => {
      it('returns 401 Unauthorized', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks/${stockId}`);
        expect(response.status()).toBe(401);
      });
    });

    describe('when stock does not exist', () => {
      it('returns 404 Not Found', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks/999999`, {
          headers: { Authorization: authToken },
        });
        expect(response.status()).toBe(404);
      });
    });
  });

  describe('PATCH /stocks/:id', () => {
    describe('when authenticated and stock exists', () => {
      it('updates the stock and returns 200', async ({ request }) => {
        const response = await request.patch(`${apiV2}/stocks/${stockId}`, {
          headers: { Authorization: authToken },
          data: { label: 'E2E V2 Stock Updated', description: 'Description modifiée' },
        });

        expect(response.status()).toBe(200);
      });
    });
  });

  // ─── ITEMS ─────────────────────────────────────────────────────────────────

  describe('POST /stocks/:id/items', () => {
    describe('when authenticated and stock exists', () => {
      it('adds an item and returns 201', async ({ request }) => {
        const response = await request.post(`${apiV2}/stocks/${stockId}/items`, {
          headers: { Authorization: authToken },
          data: {
            label: 'E2E V2 Item',
            description: 'Item créé par le test API V2',
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
      });
    });
  });

  describe('GET /stocks/:id/items', () => {
    describe('when authenticated and stock exists', () => {
      it('returns the items list with correct DTO shape and status', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks/${stockId}/items`, {
          headers: { Authorization: authToken },
        });

        expect(response.status()).toBe(200);
        const items = await response.json();
        expect(Array.isArray(items)).toBe(true);
        const found = items.find((i: any) => i.id === itemId);
        expect(found).toBeDefined();
        expect(found.quantity).toBe(42);
        expect(found.minimumStock).toBe(5);
        // quantity:42 > minimumStock*3 (15) → overstocked
        expect(found.status).toBe('overstocked');
      });
    });

    describe('when stock does not exist', () => {
      it('returns 404 Not Found', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks/999999/items`, {
          headers: { Authorization: authToken },
        });
        expect(response.status()).toBe(404);
      });
    });
  });

  describe('PATCH /stocks/:id/items/:itemId', () => {
    describe('when authenticated and item exists', () => {
      it('updates the quantity and returns 200', async ({ request }) => {
        const response = await request.patch(`${apiV2}/stocks/${stockId}/items/${itemId}`, {
          headers: { Authorization: authToken },
          data: { quantity: 99 },
        });

        expect(response.status()).toBe(200);

        // PATCH returns domain entity (no computed status) — verify via GET
        const getResponse = await request.get(`${apiV2}/stocks/${stockId}/items`, {
          headers: { Authorization: authToken },
        });
        expect(getResponse.status()).toBe(200);
        const items = await getResponse.json();
        const updatedItem = items.find((i: any) => i.id === itemId);
        if (updatedItem) {
          expect(updatedItem.quantity).toBe(99);
          // quantity:99 > minimumStock*3 (15) → overstocked
          expect(updatedItem.status).toBe('overstocked');
        }
      });
    });
  });

  // ─── STATUS LIFECYCLE ──────────────────────────────────────────────────────

  describe('Item status lifecycle', () => {
    let statusStockId: number;
    let statusItemId: number;
    const MIN = 10;

    it.beforeAll(async ({ request }) => {
      const stockRes = await request.post(`${apiV2}/stocks`, {
        headers: { Authorization: authToken },
        data: {
          label: 'E2E Status Stock',
          description: 'Stock for status lifecycle tests',
          category: 'alimentation',
        },
      });
      statusStockId = (await stockRes.json()).id;

      const itemRes = await request.post(`${apiV2}/stocks/${statusStockId}/items`, {
        headers: { Authorization: authToken },
        data: { label: 'E2E Status Item', quantity: 3, minimumStock: MIN },
      });
      const body = await itemRes.json();
      statusItemId = body.items.find((i: any) => i.label === 'E2E Status Item').id;
    });

    it.afterAll(async ({ request }) => {
      await request.delete(`${apiV2}/stocks/${statusStockId}`, {
        headers: { Authorization: authToken },
      });
    });

    const patchQuantity = async (request: any, quantity: number) => {
      const res = await request.patch(`${apiV2}/stocks/${statusStockId}/items/${statusItemId}`, {
        headers: { Authorization: authToken },
        data: { quantity },
      });
      expect(res.status()).toBe(200);
      // PATCH returns domain entity (no computed status) — verify via GET
      const getRes = await request.get(`${apiV2}/stocks/${statusStockId}/items`, {
        headers: { Authorization: authToken },
      });
      const items = await getRes.json();
      return items.find((i: any) => i.id === statusItemId);
    };

    it('quantity:3 ≤ min:10 → critical', async ({ request }) => {
      const item = await patchQuantity(request, 3);
      expect(item?.status).toBe('critical');
    });

    it('quantity:14 ≤ min*1.5 (15) → low', async ({ request }) => {
      const item = await patchQuantity(request, 14);
      expect(item?.status).toBe('low');
    });

    it('quantity:20 in (15, 30] → optimal', async ({ request }) => {
      const item = await patchQuantity(request, 20);
      expect(item?.status).toBe('optimal');
    });

    it('quantity:31 > min*3 (30) → overstocked', async ({ request }) => {
      const item = await patchQuantity(request, 31);
      expect(item?.status).toBe('overstocked');
    });

    it('quantity:0 → out-of-stock', async ({ request }) => {
      const item = await patchQuantity(request, 0);
      expect(item?.status).toBe('out-of-stock');
    });
  });

  describe('DELETE /stocks/:id/items/:itemId', () => {
    describe('when authenticated and item exists', () => {
      it('deletes the item and returns 204', async ({ request }) => {
        const response = await request.delete(`${apiV2}/stocks/${stockId}/items/${itemId}`, {
          headers: { Authorization: authToken },
        });

        expect(response.status()).toBe(204);
      });

      it('item is no longer present after deletion', async ({ request }) => {
        const response = await request.get(`${apiV2}/stocks/${stockId}/items`, {
          headers: { Authorization: authToken },
        });
        const items = await response.json();
        expect(items.find((i: any) => i.id === itemId)).toBeUndefined();
      });
    });
  });

  describe('DELETE /stocks/:id', () => {
    describe('when authenticated and stock exists', () => {
      it('deletes the stock and returns 204', async ({ request }) => {
        const response = await request.delete(`${apiV2}/stocks/${stockId}`, {
          headers: { Authorization: authToken },
        });

        expect(response.status()).toBe(204);
      });
    });
  });
});
