/*
  Warnings:

  - Made the column `STOCK_ID` on table `items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_ibfk_1`;

-- AlterTable
ALTER TABLE `items` MODIFY `STOCK_ID` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`STOCK_ID`) REFERENCES `stocks`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;
