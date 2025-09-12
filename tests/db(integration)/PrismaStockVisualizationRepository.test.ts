import {PrismaClient} from "../../src/generated/prisma";
import {PrismaStockVisualizationRepository} from "../../src/db/repositories/PrismaStockVisualizationRepository";

const prisma = new PrismaClient();
const repo = new PrismaStockVisualizationRepository();


describe("PrismaStockVisualizationRepository (integration)", () => {
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

    it("should return empty array if no stocks for user", async () => {
        const stocks = await repo.getAllStocks(9999);
        expect(stocks).toEqual([]);
    });

    it("should return stock details when stock exists", async () => {
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

    it("should return items of a stock", async () => {
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
        expect(items[0].label).toBe("Item1");
        expect(items[0].quantity.value).toBe(5);
    });

    it("should throw if stock does not belong to user", async () => {
        const user1 = await prisma.users.create({data: {EMAIL: "user1@test.com"}});
        const user2 = await prisma.users.create({data: {EMAIL: "user2@test.com"}});

        const stock = await prisma.stocks.create({
            data: {USER_ID: user2.ID, LABEL: "Stock other user", CATEGORY: "alimentation"},
        });

        await expect(repo.getStockItems(stock.ID, user1.ID)).rejects.toThrow(
            "Stock not found or access denied"
        );
    });
});
