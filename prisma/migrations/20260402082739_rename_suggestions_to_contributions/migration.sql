/*
  Warnings:

  - You are about to drop the `item_suggestions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `item_suggestions` DROP FOREIGN KEY `item_suggestions_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `item_suggestions` DROP FOREIGN KEY `item_suggestions_reviewedBy_fkey`;

-- DropForeignKey
ALTER TABLE `item_suggestions` DROP FOREIGN KEY `item_suggestions_stockId_fkey`;

-- DropForeignKey
ALTER TABLE `item_suggestions` DROP FOREIGN KEY `item_suggestions_suggestedBy_fkey`;

-- DropTable
DROP TABLE `item_suggestions`;

-- CreateTable
CREATE TABLE `item_contributions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `contributedBy` INTEGER NOT NULL,
    `suggestedQuantity` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedBy` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `item_contributions_stockId_status_idx`(`stockId`, `status`),
    INDEX `item_contributions_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `item_contributions` ADD CONSTRAINT `item_contributions_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_contributions` ADD CONSTRAINT `item_contributions_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_contributions` ADD CONSTRAINT `item_contributions_contributedBy_fkey` FOREIGN KEY (`contributedBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_contributions` ADD CONSTRAINT `item_contributions_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
