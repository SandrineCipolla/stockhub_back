-- AlterTable
ALTER TABLE `items` ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `item_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `oldQuantity` INTEGER NOT NULL,
    `newQuantity` INTEGER NOT NULL,
    `changeType` VARCHAR(20) NOT NULL,
    `changedBy` VARCHAR(255) NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `item_history_itemId_changedAt_idx`(`itemId`, `changedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_predictions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `daysUntilEmpty` INTEGER NULL,
    `avgDailyConsumption` DOUBLE NULL,
    `trend` VARCHAR(20) NOT NULL,
    `recommendedRestock` INTEGER NULL,
    `simulatedFallback` BOOLEAN NOT NULL DEFAULT false,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_predictions_itemId_generatedAt_idx`(`itemId`, `generatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `item_history` ADD CONSTRAINT `item_history_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_predictions` ADD CONSTRAINT `stock_predictions_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
