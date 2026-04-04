import { PrismaStockVisualizationRepository } from '@infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository';
import {
  clearTestData,
  closeTestDatabase,
  setupTestDatabase,
  TestDatabaseSetup,
} from '../../../helpers/testContainerSetup';

describe('PrismaStockVisualizationRepository', () => {
  let setup: TestDatabaseSetup;
  let repo: PrismaStockVisualizationRepository;

  beforeAll(async () => {
    setup = await setupTestDatabase();
    repo = new PrismaStockVisualizationRepository();
  }, 60000);

  afterAll(async () => {
    await closeTestDatabase(setup);
  });

  beforeEach(async () => {
    await clearTestData(setup.prisma);
  });

  describe('getAllStocks', () => {
    describe('when user has no stocks', () => {
      it('should return an empty array', async () => {
        const stocks = await repo.getAllStocks(9999);
        expect(stocks).toEqual([]);
      });
    });

    describe('when user owns a stock', () => {
      it('should return the stock with viewerRole OWNER', async () => {
        const owner = await setup.prisma.user.create({
          data: { email: 'owner@test.com' },
        });

        await setup.prisma.stock.create({
          data: {
            userId: owner.id,
            label: 'Mon Stock',
            category: 'alimentation',
          },
        });

        const results = await repo.getAllStocks(owner.id);

        expect(results).toHaveLength(1);
        expect(results[0].viewerRole).toBe('OWNER');
        expect(results[0].stock.getLabelValue()).toBe('Mon Stock');
      });
    });

    describe('when user is a collaborator on a stock', () => {
      it('should return the stock with the correct viewerRole', async () => {
        const owner = await setup.prisma.user.create({
          data: { email: 'owner2@test.com' },
        });
        const collaborator = await setup.prisma.user.create({
          data: { email: 'collab@test.com' },
        });

        const stock = await setup.prisma.stock.create({
          data: {
            userId: owner.id,
            label: 'Stock Partagé',
            category: 'alimentation',
          },
        });

        await setup.prisma.stockCollaborator.create({
          data: {
            stockId: stock.id,
            userId: collaborator.id,
            role: 'VIEWER_CONTRIBUTOR',
          },
        });

        const results = await repo.getAllStocks(collaborator.id);

        expect(results).toHaveLength(1);
        expect(results[0].viewerRole).toBe('VIEWER_CONTRIBUTOR');
        expect(results[0].stock.getLabelValue()).toBe('Stock Partagé');
      });
    });

    describe('when user owns stocks and is collaborator on others', () => {
      it('should return all stocks with correct viewerRoles', async () => {
        const owner = await setup.prisma.user.create({
          data: { email: 'owner3@test.com' },
        });
        const user = await setup.prisma.user.create({
          data: { email: 'user3@test.com' },
        });

        await setup.prisma.stock.create({
          data: { userId: user.id, label: 'Mon Stock', category: 'alimentation' },
        });

        const sharedStock = await setup.prisma.stock.create({
          data: { userId: owner.id, label: 'Stock Partagé', category: 'hygiene' },
        });

        await setup.prisma.stockCollaborator.create({
          data: { stockId: sharedStock.id, userId: user.id, role: 'EDITOR' },
        });

        const results = await repo.getAllStocks(user.id);

        expect(results).toHaveLength(2);
        const owned = results.find(r => r.viewerRole === 'OWNER');
        const shared = results.find(r => r.viewerRole === 'EDITOR');
        expect(owned?.stock.getLabelValue()).toBe('Mon Stock');
        expect(shared?.stock.getLabelValue()).toBe('Stock Partagé');
      });
    });
  });

  describe('getStockDetails', () => {
    describe('when stock exists for user', () => {
      it('should return stock details', async () => {
        const user = await setup.prisma.user.create({
          data: { email: 'user@test.com' },
        });

        const stock = await setup.prisma.stock.create({
          data: {
            userId: user.id,
            label: 'Test Stock',
            description: 'desc',
            category: 'alimentation',
          },
        });

        const result = await repo.getStockDetails(stock.id, user.id);

        expect(result).not.toBeNull();
        expect(result?.label).toBe('Test Stock');
        expect(result?.category).toBe('alimentation');
      });
    });
  });

  describe('getStockItems', () => {
    describe('when stock contains items', () => {
      it('should return items of the stock', async () => {
        const user = await setup.prisma.user.create({
          data: { email: 'items@test.com' },
        });

        const stock = await setup.prisma.stock.create({
          data: {
            userId: user.id,
            label: 'Stock with items',
            category: 'alimentation',
          },
        });

        await setup.prisma.item.create({
          data: {
            label: 'Item1',
            quantity: 5,
            minimumStock: 1,
            stockId: stock.id,
          },
        });

        const items = await repo.getStockItems(stock.id, user.id);

        expect(items).toHaveLength(1);
        expect(items[0].label).toBe('Item1');
        expect(items[0].quantity).toBe(5);
      });
    });

    describe('when stock belongs to another user', () => {
      it('should throw an error', async () => {
        const user1 = await setup.prisma.user.create({
          data: { email: 'user1@test.com' },
        });
        const user2 = await setup.prisma.user.create({
          data: { email: 'user2@test.com' },
        });

        const stock = await setup.prisma.stock.create({
          data: {
            userId: user2.id,
            label: 'Stock other user',
            category: 'alimentation',
          },
        });

        await expect(repo.getStockItems(stock.id, user1.id)).rejects.toThrow(
          'Stock not found or access denied'
        );
      });
    });
  });
});
