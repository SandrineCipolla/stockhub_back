import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TestDatabaseSetup {
  container: StartedMySqlContainer;
  prisma: PrismaClient;
  connectionString: string;
}

export async function setupTestDatabase(): Promise<TestDatabaseSetup> {
  // Start MySQL container
  const container = await new MySqlContainer('mysql:8.0')
    .withDatabase('stockhub_test')
    .withUsername('test')
    .withRootPassword('test')
    .start();

  const connectionString = `mysql://test:test@${container.getHost()}:${container.getPort()}/stockhub_test`;

  // Set DATABASE_URL for Prisma
  process.env.DATABASE_URL = connectionString;

  // Push Prisma schema to the test database
  await execAsync('npx prisma db push --skip-generate --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: connectionString },
  });

  // Initialize Prisma client with the test database connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  return { container, prisma, connectionString };
}

export async function closeTestDatabase(setup: TestDatabaseSetup): Promise<void> {
  await setup.prisma.$disconnect();
  await setup.container.stop();
}

export async function clearTestData(prisma: PrismaClient): Promise<void> {
  await prisma.items.deleteMany({});
  await prisma.stocks.deleteMany({});
  await prisma.users.deleteMany({});
}
