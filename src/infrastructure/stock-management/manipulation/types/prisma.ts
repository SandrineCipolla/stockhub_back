import { items, stocks } from '@prisma/client';

export type PrismaStockWithItems = stocks & {
  items?: items[];
};
