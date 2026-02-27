import { PrismaStockCommandRepository } from '@infrastructure/stock-management/manipulation/repositories/PrismaStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';
import {
  clearTestData,
  closeTestDatabase,
  setupTestDatabase,
  TestDatabaseSetup,
} from '@helpers/testContainerSetup';

describe('PrismaStockCommandRepository', () => {
  let setup: TestDatabaseSetup;
  let repository: PrismaStockCommandRepository;

  beforeAll(async () => {
    setup = await setupTestDatabase();
    repository = new PrismaStockCommandRepository(setup.prisma);
  }, 60000);

  afterAll(async () => {
    await closeTestDatabase(setup);
  });

  beforeEach(async () => {
    await clearTestData(setup.prisma);

    // Create a test user
    await setup.prisma.user.create({
      data: {
        id: 1,
        email: 'test@test.com',
      },
    });
  });

  describe('save', () => {
    describe('when saving a new stock with items to database', () => {
      it('should persist stock and items correctly in MySQL', async () => {
        const stock = Stock.create({
          label: 'Integration Test Stock',
          description: 'This is an integration test',
          category: 'alimentation',
          userId: 1,
        });

        stock.addItem({
          label: 'Test Item 1',
          quantity: 10,
          description: 'First test item',
          minimumStock: 5,
        });

        stock.addItem({
          label: 'Test Item 2',
          quantity: 20,
          description: 'Second test item',
          minimumStock: 10,
        });

        const savedStock = await repository.save(stock, 1);

        expect(savedStock.id).toBeGreaterThan(0);
        expect(savedStock.getLabelValue()).toBe('Integration Test Stock');

        expect(savedStock.getTotalItems()).toBe(2);
        expect(savedStock.getTotalQuantity()).toBe(30);

        // Verify directly in database
        const stockInDb = await setup.prisma.stock.findUnique({
          where: { id: savedStock.id },
          include: { items: true },
        });

        expect(stockInDb).toBeDefined();
        expect(stockInDb?.label).toBe('Integration Test Stock');
        expect(stockInDb?.description).toBe('This is an integration test');
        expect(stockInDb?.category).toBe('alimentation');
        expect(stockInDb?.items).toHaveLength(2);
        expect(stockInDb?.items[0].label).toBe('Test Item 1');
        expect(stockInDb?.items[0].quantity).toBe(10);
        expect(stockInDb?.items[1].label).toBe('Test Item 2');
        expect(stockInDb?.items[1].quantity).toBe(20);
      });
    });
  });

  describe('addItemToStock()', () => {
    describe('when adding an item to an existing stock', () => {
      it('should persist the new item and update stock in MySQL', async () => {
        const createdStock = await setup.prisma.stock.create({
          data: {
            label: 'Existing Stock',
            description: 'Stock for item addition test',
            category: 'alimentation',
            userId: 1,
          },
        });

        await setup.prisma.item.create({
          data: {
            label: 'Initial Item',
            quantity: 5,
            description: 'Initial item',
            minimumStock: 2,
            stockId: createdStock.id,
          },
        });

        const updatedStock = await repository.addItemToStock(createdStock.id, {
          label: 'New Item',
          quantity: 15,
          description: 'Newly added item',
          minimumStock: 8,
        });

        expect(updatedStock.getTotalItems()).toBe(2);
        expect(updatedStock.getTotalQuantity()).toBe(20);

        const stockInDb = await setup.prisma.stock.findUnique({
          where: { id: createdStock.id },
          include: { items: true },
        });

        expect(stockInDb?.items).toHaveLength(2);

        const newItem = stockInDb?.items.find(item => item.label === 'New Item');
        expect(newItem?.quantity).toBe(15);
        expect(newItem?.stockId).toBe(createdStock.id);
      });
    });
  });
});
