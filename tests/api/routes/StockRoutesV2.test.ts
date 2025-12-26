import express from 'express';
import request from 'supertest';

import { PrismaClient } from '@prisma/client';
import configureStockRoutesV2 from '@api/routes/StockRoutesV2';

const prisma = new PrismaClient();
const TEST_OID = 'fake-oid-test';
let testUserId: number;
let server: any;

describe('StockRoutesV2 (integration with fake Azure auth)', () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    app.use((req, res, next) => {
      const auth = req.headers['authorization'];
      if (auth && auth === 'Bearer test-token') {
        (req as any).userID = TEST_OID;
        return next();
      }
      return res.status(403).json({ error: 'Forbidden: invalid or missing token' });
    });

    const stockRoutes = await configureStockRoutesV2();
    app.use('/', stockRoutes);

    await prisma.$connect();
    server = app.listen(0);
  });

  beforeEach(async () => {
    await prisma.items.deleteMany();
    await prisma.stocks.deleteMany();
    await prisma.users.deleteMany({ where: { EMAIL: TEST_OID } });

    const user = await prisma.users.create({ data: { EMAIL: TEST_OID } });
    testUserId = user.ID;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  describe('GET /stocks', () => {
    describe('when no Authorization header', () => {
      it('should return 403', async () => {
        const res = await request(server).get('/stocks');
        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Forbidden: invalid or missing token' });
      });
    });

    describe('when invalid token', () => {
      it('should return 403', async () => {
        const res = await request(server).get('/stocks').set('Authorization', 'Bearer wrong-token');

        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Forbidden: invalid or missing token' });
      });
    });

    describe('when valid token', () => {
      it('should return empty array if no stocks', async () => {
        const res = await request(server).get('/stocks').set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it('should return created stock', async () => {
        await prisma.stocks.create({
          data: {
            USER_ID: testUserId,
            LABEL: 'API Stock',
            DESCRIPTION: 'desc',
            CATEGORY: 'alimentation',
          },
        });

        const res = await request(server).get('/stocks').set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].label).toBe('API Stock');
      });
    });
  });

  describe('GET /stocks/:id', () => {
    describe('when valid token', () => {
      it('should return stock details', async () => {
        const stock = await prisma.stocks.create({
          data: {
            USER_ID: testUserId,
            LABEL: 'Detail Stock',
            DESCRIPTION: 'desc',
            CATEGORY: 'alimentation',
          },
        });

        const res = await request(server)
          .get(`/stocks/${stock.ID}`)
          .set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body.label).toBe('Detail Stock');
      });
    });

    describe('when stock does not exist', () => {
      it('should return 404 or 500 depending on controller', async () => {
        const res = await request(server)
          .get('/stocks/99999')
          .set('Authorization', 'Bearer test-token');

        expect([404, 500]).toContain(res.status);
      });
    });
  });

  describe('GET /stocks/:id/items', () => {
    describe('when valid token', () => {
      it('should return stock items', async () => {
        const stock = await prisma.stocks.create({
          data: {
            USER_ID: testUserId,
            LABEL: 'Stock with items',
            CATEGORY: 'alimentation',
          },
        });

        await prisma.items.create({
          data: {
            LABEL: 'Item1',
            QUANTITY: 5,
            MINIMUM_STOCK: 1,
            STOCK_ID: stock.ID,
          },
        });

        const res = await request(server)
          .get(`/stocks/${stock.ID}/items`)
          .set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].label).toBe('Item1');
      });
    });
  });
});
