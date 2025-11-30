import {MySqlContainer, StartedMySqlContainer} from '@testcontainers/mysql';
import {PrismaClient} from '@prisma/client';
import {exec} from 'child_process';
import {promisify} from 'util';
import {
    PrismaStockCommandRepository
} from '../../../../src/infrastructure/stock-management/manipulation/repositories/PrismaStockCommandRepository';
import {Stock} from '../../../../src/domain/stock-management/common/entities/Stock';

const execAsync = promisify(exec);

describe('PrismaStockCommandRepository', () => {
    let container: StartedMySqlContainer;
    let prismaTest: PrismaClient;
    let repository: PrismaStockCommandRepository;

    beforeAll(async () => {
        container = await new MySqlContainer('mysql:8.0')
            .withDatabase('stockhub_test')
            .withUsername('test')
            .withRootPassword('test')
            .start();

        const connectionString = `mysql://test:test@${container.getHost()}:${container.getPort()}/stockhub_test`;

        // DATABASE_URL for Prisma
        process.env.DATABASE_URL = connectionString;

        // Push Prisma schema to the test database
        await execAsync('npx prisma db push --skip-generate --accept-data-loss', {
            env: {...process.env, DATABASE_URL: connectionString}
        });

        // Initialize Prisma client with the test database connection
        prismaTest = new PrismaClient({
            datasources: {
                db: {
                    url: connectionString
                }
            }
        });

        // Inject the test Prisma client into the repository
        repository = new PrismaStockCommandRepository(prismaTest);
    }, 60000); //timeout for container startup

    afterAll(async () => {
        await prismaTest.$disconnect();
        await container.stop();
    });

    beforeEach(async () => {
        await prismaTest.items.deleteMany({});
        await prismaTest.stocks.deleteMany({});
        await prismaTest.users.deleteMany({});

        // Create a test user
        await prismaTest.users.create({
            data: {
                ID: 1,
                EMAIL: 'test@test.com'
            }
        });
    });

    describe('save', () => {
        describe('when saving a new stock with items to database', () => {
            it('should persist stock and items correctly in MySQL', async () => {
                const stock = Stock.create({
                    label: 'Integration Test Stock',
                    description: 'This is an integration test',
                    category: 'alimentation',
                    userId: 1
                });

                stock.addItem({
                    label: 'Test Item 1',
                    quantity: 10,
                    description: 'First test item',
                    minimumStock: 5
                });

                stock.addItem({
                    label: 'Test Item 2',
                    quantity: 20,
                    description: 'Second test item',
                    minimumStock: 10
                });

                const savedStock = await repository.save(stock, 1);

                expect(savedStock.id).toBeGreaterThan(0);
                expect(savedStock.getLabelValue()).toBe('Integration Test Stock');

                expect(savedStock.getTotalItems()).toBe(2);
                expect(savedStock.getTotalQuantity()).toBe(30);

                // Verify directly in database
                const stockInDb = await prismaTest.stocks.findUnique({
                    where: {ID: savedStock.id},
                    include: {items: true}
                });

                expect(stockInDb).toBeDefined();
                expect(stockInDb?.LABEL).toBe('Integration Test Stock');
                expect(stockInDb?.DESCRIPTION).toBe('This is an integration test');
                expect(stockInDb?.CATEGORY).toBe('alimentation');
                expect(stockInDb?.items).toHaveLength(2);
                expect(stockInDb?.items[0].LABEL).toBe('Test Item 1');
                expect(stockInDb?.items[0].QUANTITY).toBe(10);
                expect(stockInDb?.items[1].LABEL).toBe('Test Item 2');
                expect(stockInDb?.items[1].QUANTITY).toBe(20);
            });
        });
    });

    describe('addItemToStock()', () => {
        describe('when adding an item to an existing stock', () => {
            it('should persist the new item and update stock in MySQL', async () => {

                const createdStock = await prismaTest.stocks.create({
                    data: {
                        LABEL: 'Existing Stock',
                        DESCRIPTION: 'Stock for item addition test',
                        CATEGORY: 'alimentation',
                        USER_ID: 1
                    }
                });

                await prismaTest.items.create({
                    data: {
                        LABEL: 'Initial Item',
                        QUANTITY: 5,
                        DESCRIPTION: 'Initial item',
                        MINIMUM_STOCK: 2,
                        STOCK_ID: createdStock.ID
                    }
                });

                const updatedStock = await repository.addItemToStock(
                    createdStock.ID,
                    {
                        label: 'New Item',
                        quantity: 15,
                        description: 'Newly added item',
                        minimumStock: 8
                    }
                );

                expect(updatedStock.getTotalItems()).toBe(2);
                expect(updatedStock.getTotalQuantity()).toBe(20);

                const stockInDb = await prismaTest.stocks.findUnique({
                    where: {ID: createdStock.ID},
                    include: {items: true}
                });

                expect(stockInDb?.items).toHaveLength(2);

                const newItem = stockInDb?.items.find(item => item.LABEL === 'New Item');
                expect(newItem?.QUANTITY).toBe(15);
                expect(newItem?.STOCK_ID).toBe(createdStock.ID);
            });
        });
    });
});
