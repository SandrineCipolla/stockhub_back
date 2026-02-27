import express from 'express';
import request from 'supertest';
import {
  clearTestData,
  closeTestDatabase,
  setupTestDatabase,
  TestDatabaseSetup,
} from '@helpers/testContainerSetup';
import {
  authorizeStockRead,
  authorizeStockSuggest,
  authorizeStockWrite,
} from '@authorization/authorizeMiddleware';
import { StockRole, StockCategory } from '@prisma/client';

// Test helpers to reduce duplication
const createTestUser = async (prisma: any, overrides?: { id?: number; email?: string }) => {
  return prisma.user.create({
    data: {
      id: overrides?.id ?? 1,
      email: overrides?.email ?? 'test@example.com',
    },
  });
};

const createTestStock = async (
  prisma: any,
  userId: number,
  overrides?: {
    label?: string;
    description?: string;
    category?: StockCategory;
  }
) => {
  return prisma.stock.create({
    data: {
      label: overrides?.label ?? 'Test Stock',
      description: overrides?.description ?? 'Test Description',
      category: overrides?.category ?? StockCategory.alimentation,
      userId: userId,
    },
  });
};

const createTestApp = (userEmail: string) => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).userID = userEmail;
    next();
  });
  return app;
};

// FIXME: These tests are skipped due to Issue #71
// The middleware creates its own PrismaClient which prevents injection of test database client
// See: https://github.com/SandrineCipolla/stockhub_back/issues/71
describe.skip('Authorization Middleware Integration Tests', () => {
  let setup: TestDatabaseSetup;

  beforeAll(async () => {
    setup = await setupTestDatabase();
  }, 60000);

  afterAll(async () => {
    await closeTestDatabase(setup);
  });

  beforeEach(async () => {
    await clearTestData(setup.prisma);
  });

  describe('when user is not authenticated', () => {
    it('should return 401 Unauthorized', async () => {
      const app = express();
      app.use(express.json());
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app).get('/stocks/1').expect(401);

      expect(response.body).toMatchObject({
        error: 'Unauthorized - Authentication required',
      });
    });
  });

  describe('when stockId is invalid', () => {
    it('should return 400 Bad Request', async () => {
      const app = createTestApp('test@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app).get('/stocks/invalid').expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid stock ID',
      });
    });
  });

  describe('when user does not exist in database', () => {
    it('should return 401 Unauthorized', async () => {
      const app = createTestApp('nonexistent@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app).get('/stocks/1').expect(401);

      expect(response.body).toMatchObject({
        error: 'User not found',
      });
    });
  });

  describe('when stock does not exist', () => {
    it('should return 404 Not Found', async () => {
      await createTestUser(setup.prisma, { id: 1, email: 'test@example.com' });

      const app = createTestApp('test@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app).get('/stocks/999').expect(404);

      expect(response.body).toMatchObject({
        error: 'Stock not found',
      });
    });
  });

  describe('when user is the stock owner', () => {
    it('should grant full access (read, write, suggest)', async () => {
      const owner = await createTestUser(setup.prisma, { id: 1, email: 'owner@example.com' });
      const stock = await createTestStock(setup.prisma, owner.id);

      const app = createTestApp('owner@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => res.json({ success: true }));
      app.post('/stocks/:stockId/items', authorizeStockWrite, (_req, res) =>
        res.json({ success: true })
      );
      app.post('/stocks/:stockId/suggest', authorizeStockSuggest, (_req, res) =>
        res.json({ success: true })
      );

      await request(app).get(`/stocks/${stock.id}`).expect(200);
      await request(app).post(`/stocks/${stock.id}/items`).expect(200);
      await request(app).post(`/stocks/${stock.id}/suggest`).expect(200);
    });
  });

  describe('when user is not owner or collaborator', () => {
    it('should return 403 Forbidden', async () => {
      const owner = await createTestUser(setup.prisma, { id: 1, email: 'owner@example.com' });
      await createTestUser(setup.prisma, { id: 2, email: 'other@example.com' });
      const stock = await createTestStock(setup.prisma, owner.id);

      const app = createTestApp('other@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => res.json({ success: true }));

      const response = await request(app).get(`/stocks/${stock.id}`).expect(403);

      expect(response.body).toMatchObject({
        error: 'Forbidden - You do not have access to this stock',
      });
    });
  });

  describe('when user has EDITOR role', () => {
    it('should grant read, write, and suggest access', async () => {
      const owner = await createTestUser(setup.prisma, { id: 1, email: 'owner@example.com' });
      const editor = await createTestUser(setup.prisma, { id: 2, email: 'editor@example.com' });
      const stock = await createTestStock(setup.prisma, owner.id);

      await setup.prisma.stockCollaborator.create({
        data: {
          stockId: stock.id,
          userId: editor.id,
          role: StockRole.EDITOR,
          grantedBy: owner.id,
        },
      });

      const app = createTestApp('editor@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => res.json({ success: true }));
      app.post('/stocks/:stockId/items', authorizeStockWrite, (_req, res) =>
        res.json({ success: true })
      );
      app.post('/stocks/:stockId/suggest', authorizeStockSuggest, (_req, res) =>
        res.json({ success: true })
      );

      await request(app).get(`/stocks/${stock.id}`).expect(200);
      await request(app).post(`/stocks/${stock.id}/items`).expect(200);
      await request(app).post(`/stocks/${stock.id}/suggest`).expect(200);
    });
  });

  describe('when user has VIEWER role', () => {
    it('should grant read access only', async () => {
      const owner = await createTestUser(setup.prisma, { id: 1, email: 'owner@example.com' });
      const viewer = await createTestUser(setup.prisma, { id: 2, email: 'viewer@example.com' });
      const stock = await createTestStock(setup.prisma, owner.id);

      await setup.prisma.stockCollaborator.create({
        data: {
          stockId: stock.id,
          userId: viewer.id,
          role: StockRole.VIEWER,
          grantedBy: owner.id,
        },
      });

      const app = createTestApp('viewer@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => res.json({ success: true }));
      app.post('/stocks/:stockId/items', authorizeStockWrite, (_req, res) =>
        res.json({ success: true })
      );
      app.post('/stocks/:stockId/suggest', authorizeStockSuggest, (_req, res) =>
        res.json({ success: true })
      );

      await request(app).get(`/stocks/${stock.id}`).expect(200);

      const writeResponse = await request(app).post(`/stocks/${stock.id}/items`).expect(403);
      expect(writeResponse.body.error).toContain('does not allow write access');

      const suggestResponse = await request(app).post(`/stocks/${stock.id}/suggest`).expect(403);
      expect(suggestResponse.body.error).toContain('does not allow suggest access');
    });
  });

  describe('when user has VIEWER_CONTRIBUTOR role', () => {
    it('should grant read and suggest access but not write', async () => {
      const owner = await createTestUser(setup.prisma, { id: 1, email: 'owner@example.com' });
      const contributor = await createTestUser(setup.prisma, {
        id: 2,
        email: 'contributor@example.com',
      });
      const stock = await createTestStock(setup.prisma, owner.id);

      await setup.prisma.stockCollaborator.create({
        data: {
          stockId: stock.id,
          userId: contributor.id,
          role: StockRole.VIEWER_CONTRIBUTOR,
          grantedBy: owner.id,
        },
      });

      const app = createTestApp('contributor@example.com');
      app.get('/stocks/:stockId', authorizeStockRead, (_req, res) => res.json({ success: true }));
      app.post('/stocks/:stockId/items', authorizeStockWrite, (_req, res) =>
        res.json({ success: true })
      );
      app.post('/stocks/:stockId/suggest', authorizeStockSuggest, (_req, res) =>
        res.json({ success: true })
      );

      await request(app).get(`/stocks/${stock.id}`).expect(200);
      await request(app).post(`/stocks/${stock.id}/suggest`).expect(200);

      const writeResponse = await request(app).post(`/stocks/${stock.id}/items`).expect(403);
      expect(writeResponse.body.error).toContain('does not allow write access');
    });
  });
});
