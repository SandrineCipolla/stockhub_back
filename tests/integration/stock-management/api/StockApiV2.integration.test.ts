import express from 'express';
import request from 'supertest';
import configureStockRoutesV2 from '@api/routes/StockRoutesV2';
import {
  clearTestData,
  closeTestDatabase,
  setupTestDatabase,
  TestDatabaseSetup,
} from '@helpers/testContainerSetup';

jest.mock('@services/userService', () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      return {
        convertOIDtoUserID: jest.fn().mockResolvedValue({
          empty: false,
          value: 1,
        }),
        addUser: jest.fn(),
      };
    }),
  };
});

describe('Stock API V2 Integration Tests', () => {
  let setup: TestDatabaseSetup;
  let app: express.Express;

  beforeAll(async () => {
    setup = await setupTestDatabase();

    app = express();
    app.use(express.json());

    // Mock authentication middleware
    app.use((req, _res, next) => {
      (req as any).userID = 'test-user-oid-123';
      next();
    });

    // Configure stock routes with injected test Prisma client
    const stockRoutesV2 = await configureStockRoutesV2(setup.prisma);
    app.use('/api/v2', stockRoutesV2);
  }, 60000);

  afterAll(async () => {
    await closeTestDatabase(setup);
  });

  beforeEach(async () => {
    await clearTestData(setup.prisma);

    // Create a test user
    await setup.prisma.users.create({
      data: {
        ID: 1,
        EMAIL: 'test-user-oid-123',
      },
    });
  });

  describe('GET /api/v2/stocks', () => {
    describe('when user has no stocks', () => {
      it('should return empty array', async () => {
        const response = await request(app).get('/api/v2/stocks').expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('when user has stocks', () => {
      it('should return all user stocks', async () => {
        await setup.prisma.stocks.create({
          data: {
            LABEL: 'Stock Alimentation',
            DESCRIPTION: 'Stock pour produits alimentaires',
            CATEGORY: 'alimentation',
            USER_ID: 1,
          },
        });

        await setup.prisma.stocks.create({
          data: {
            LABEL: 'Stock Hygiène',
            DESCRIPTION: "Stock pour produits d'hygiène",
            CATEGORY: 'hygiene',
            USER_ID: 1,
          },
        });

        const response = await request(app).get('/api/v2/stocks').expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toMatchObject({
          id: expect.any(Number),
          label: 'Stock Alimentation',
          description: 'Stock pour produits alimentaires',
          category: 'alimentation',
        });
        expect(response.body[1]).toMatchObject({
          id: expect.any(Number),
          label: 'Stock Hygiène',
          description: "Stock pour produits d'hygiène",
          category: 'hygiene',
        });
      });
    });

    describe('when user is not authenticated', () => {
      it('should return 401 Unauthorized', async () => {
        //  without auth mock
        const appNoAuth = express();
        appNoAuth.use(express.json());
        const stockRoutesV2 = await configureStockRoutesV2(setup.prisma);
        appNoAuth.use('/api/v2', stockRoutesV2);

        // without authentication
        const response = await request(appNoAuth).get('/api/v2/stocks').expect(401);

        // Then: Should return authentication error
        expect(response.body).toMatchObject({
          error: 'User not authenticated',
        });
      });
    });
  });
});
