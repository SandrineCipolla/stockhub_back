import { Item, Stock } from '@prisma/client';

export type PrismaStockWithItems = Stock & {
  items?: Item[];
};
