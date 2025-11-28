import {PrismaClient} from "@prisma/client";

import {
    PrismaStockVisualizationRepository
} from "../../../../src/infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository";

const prisma = new PrismaClient();
const repo = new PrismaStockVisualizationRepository();


describe("PrismaStockVisualizationRepository", () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterEach(async () => {
        await prisma.items.deleteMany();
        await prisma.stocks.deleteMany();
        await prisma.users.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
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
                const user = await prisma.users.create({
                    data: {EMAIL: "user@test.com"},
                });

                const stock = await prisma.stocks.create({
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
                const user = await prisma.users.create({
                    data: {EMAIL: "items@test.com"},
                });

                const stock = await prisma.stocks.create({
                    data: {
                        USER_ID: user.ID,
                        LABEL: "Stock with items",
                        CATEGORY: "alimentation",
                    },
                });

                await prisma.items.create({
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
                const user1 = await prisma.users.create({
                    data: {EMAIL: "user1@test.com"},
                });
                const user2 = await prisma.users.create({
                    data: {EMAIL: "user2@test.com"},
                });

                const stock = await prisma.stocks.create({
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