import {
    PrismaStockVisualizationRepository
} from "../../../../src/infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository";
import {setupTestDatabase, teardownTestDatabase, clearTestData, TestDatabaseSetup} from '../../../helpers/testContainerSetup';

describe("PrismaStockVisualizationRepository", () => {
    let setup: TestDatabaseSetup;
    let repo: PrismaStockVisualizationRepository;

    beforeAll(async () => {
        setup = await setupTestDatabase();
        repo = new PrismaStockVisualizationRepository();
    }, 60000);

    afterAll(async () => {
        await teardownTestDatabase(setup);
    });

    beforeEach(async () => {
        await clearTestData(setup.prisma);
    });

    describe("getAllStocks", () => {
        describe("when user has no stocks", () => {
            it("should return an empty array", async () => {
                const stocks = await repo.getAllStocks(9999);
                expect(stocks).toEqual([]);
            });
        });
    });


    describe("getStockDetails", () => {
        describe("when stock exists for user", () => {
            it("should return stock details", async () => {
                const user = await setup.prisma.users.create({
                    data: {EMAIL: "user@test.com"},
                });

                const stock = await setup.prisma.stocks.create({
                    data: {
                        USER_ID: user.ID,
                        LABEL: "Test Stock",
                        DESCRIPTION: "desc",
                        CATEGORY: "alimentation",
                    },
                });

                const result = await repo.getStockDetails(stock.ID, user.ID);

                expect(result).not.toBeNull();
                expect(result?.label).toBe("Test Stock");
                expect(result?.category).toBe("alimentation");
            });
        });
    });


    describe("getStockItems", () => {
        describe("when stock contains items", () => {
            it("should return items of the stock", async () => {
                const user = await setup.prisma.users.create({
                    data: {EMAIL: "items@test.com"},
                });

                const stock = await setup.prisma.stocks.create({
                    data: {
                        USER_ID: user.ID,
                        LABEL: "Stock with items",
                        CATEGORY: "alimentation",
                    },
                });

                await setup.prisma.items.create({
                    data: {
                        LABEL: "Item1",
                        QUANTITY: 5,
                        MINIMUM_STOCK: 1,
                        STOCK_ID: stock.ID,
                    },
                });

                const items = await repo.getStockItems(stock.ID, user.ID);

                expect(items).toHaveLength(1);
                expect(items[0].LABEL).toBe("Item1");
                expect(items[0].QUANTITY).toBe(5);
            });
        });

        describe("when stock belongs to another user", () => {
            it("should throw an error", async () => {
                const user1 = await setup.prisma.users.create({
                    data: {EMAIL: "user1@test.com"},
                });
                const user2 = await setup.prisma.users.create({
                    data: {EMAIL: "user2@test.com"},
                });

                const stock = await setup.prisma.stocks.create({
                    data: {
                        USER_ID: user2.ID,
                        LABEL: "Stock other user",
                        CATEGORY: "alimentation",
                    },
                });

                await expect(repo.getStockItems(stock.ID, user1.ID)).rejects.toThrow(
                    "Stock not found or access denied"
                );
            });
        });
    });
});