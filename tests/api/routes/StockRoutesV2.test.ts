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
    await prisma.item.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.user.deleteMany({ where: { email: TEST_OID } });

    const user = await prisma.user.create({ data: { email: TEST_OID } });
    testUserId = user.id;
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
        await prisma.stock.create({
          data: {
            userId: testUserId,
            label: 'API Stock',
            description: 'desc',
            category: 'alimentation',
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
        const stock = await prisma.stock.create({
          data: {
            userId: testUserId,
            label: 'Detail Stock',
            description: 'desc',
            category: 'alimentation',
          },
        });

        const res = await request(server)
          .get(`/stocks/${stock.id}`)
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
        const stock = await prisma.stock.create({
          data: {
            userId: testUserId,
            label: 'Stock with items',
            category: 'alimentation',
          },
        });

        await prisma.item.create({
          data: {
            label: 'Item1',
            quantity: 5,
            minimumStock: 1,
            stockId: stock.id,
          },
        });

        const res = await request(server)
          .get(`/stocks/${stock.id}/items`)
          .set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].label).toBe('Item1');
      });
    });
  });
});
