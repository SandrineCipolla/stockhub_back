import {MySqlContainer, StartedMySqlContainer} from '@testcontainers/mysql';
import {PrismaClient} from '@prisma/client';
import {exec} from 'child_process';
import {promisify} from 'util';
import express from 'express';
import request from 'supertest';
import configureStockRoutesV2 from '../../../../src/api/routes/StockRoutesV2';

const execAsync = promisify(exec);


jest.mock('../../../../src/services/userService', () => {
    return {
        UserService: jest.fn().mockImplementation(() => {
            return {
                convertOIDtoUserID: jest.fn().mockResolvedValue({
                    empty: false,
                    value: 1
                }),
                addUser: jest.fn()
            };
        })
    };
});

describe('Stock API V2 Integration Tests', () => {
    let container: StartedMySqlContainer;
    let prisma: PrismaClient;
    let app: express.Express;

    beforeAll(async () => {

        container = await new MySqlContainer('mysql:8.0')
            .withDatabase('stockhub_test')
            .withUsername('test')
            .withRootPassword('test')
            .start();

        const connectionString = `mysql://test:test@${container.getHost()}:${container.getPort()}/stockhub_test`;

        process.env.DATABASE_URL = connectionString;

        await execAsync('npx prisma db push --skip-generate --accept-data-loss', {
            env: {...process.env, DATABASE_URL: connectionString}
        });

        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: connectionString
                }
            }
        });


        app = express();
        app.use(express.json());

        // Mock authentication middleware
        app.use((req, res, next) => {
            (req as any).userID = 'test-user-oid-123';
            next();
        });

        // Configure stock routes with injected test Prisma client
        const stockRoutesV2 = await configureStockRoutesV2(prisma);
        app.use('/api/v2', stockRoutesV2);

    }, 60000);

    afterAll(async () => {
        await prisma.$disconnect();
        await container.stop();
    });

    beforeEach(async () => {
        await prisma.items.deleteMany({});
        await prisma.stocks.deleteMany({});
        await prisma.users.deleteMany({});

        // Create a test user
        await prisma.users.create({
            data: {
                ID: 1,
                EMAIL: 'test-user-oid-123'
            }
        });
    });

    describe('GET /api/v2/stocks', () => {
        describe('when user has no stocks', () => {
            it('should return empty array', async () => {
                const response = await request(app)
                    .get('/api/v2/stocks')
                    .expect(200);

                expect(response.body).toEqual([]);
            });
        });

        describe('when user has stocks', () => {
            it('should return all user stocks', async () => {

                await prisma.stocks.create({
                    data: {
                        LABEL: 'Stock Alimentation',
                        DESCRIPTION: 'Stock pour produits alimentaires',
                        CATEGORY: 'alimentation',
                        USER_ID: 1
                    }
                });

                await prisma.stocks.create({
                    data: {
                        LABEL: 'Stock Hygiène',
                        DESCRIPTION: 'Stock pour produits d\'hygiène',
                        CATEGORY: 'hygiene',
                        USER_ID: 1
                    }
                });

                const response = await request(app)
                    .get('/api/v2/stocks')
                    .expect(200);

                expect(response.body).toHaveLength(2);
                expect(response.body[0]).toMatchObject({
                    id: expect.any(Number),
                    label: 'Stock Alimentation',
                    description: 'Stock pour produits alimentaires',
                    category: 'alimentation'
                });
                expect(response.body[1]).toMatchObject({
                    id: expect.any(Number),
                    label: 'Stock Hygiène',
                    description: 'Stock pour produits d\'hygiène',
                    category: 'hygiene'
                });
            });
        });

        describe('when user is not authenticated', () => {
            it('should return 401 Unauthorized', async () => {
                //  without auth mock
                const appNoAuth = express();
                appNoAuth.use(express.json());
                const stockRoutesV2 = await configureStockRoutesV2(prisma);
                appNoAuth.use('/api/v2', stockRoutesV2);

                // without authentication
                const response = await request(appNoAuth)
                    .get('/api/v2/stocks')
                    .expect(401);

                // Then: Should return authentication error
                expect(response.body).toMatchObject({
                    error: 'User not authenticated'
                });
            });
        });
    });
});
