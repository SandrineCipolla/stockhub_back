-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `quantity` INTEGER NULL,
    `minimumStock` INTEGER NOT NULL DEFAULT 1,
    `stockId` INTEGER NULL,

    INDEX `items_stockId_idx`(`stockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `category` ENUM('alimentation', 'hygiene', 'artistique') NOT NULL DEFAULT 'alimentation',
    `userId` INTEGER NULL,

    INDEX `stocks_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Family` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `NAME` VARCHAR(255) NOT NULL,
    `CREATED_AT` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FamilyMember` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `FAMILY_ID` INTEGER NOT NULL,
    `USER_ID` INTEGER NOT NULL,
    `ROLE` ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `JOINED_AT` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FamilyMember_FAMILY_ID_idx`(`FAMILY_ID`),
    INDEX `FamilyMember_USER_ID_idx`(`USER_ID`),
    UNIQUE INDEX `FamilyMember_FAMILY_ID_USER_ID_key`(`FAMILY_ID`, `USER_ID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockCollaborator` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `STOCK_ID` INTEGER NOT NULL,
    `USER_ID` INTEGER NOT NULL,
    `ROLE` ENUM('OWNER', 'EDITOR', 'VIEWER', 'VIEWER_CONTRIBUTOR') NOT NULL DEFAULT 'VIEWER',
    `GRANTED_AT` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `GRANTED_BY` INTEGER NULL,

    INDEX `StockCollaborator_STOCK_ID_idx`(`STOCK_ID`),
    INDEX `StockCollaborator_USER_ID_idx`(`USER_ID`),
    INDEX `StockCollaborator_GRANTED_BY_idx`(`GRANTED_BY`),
    UNIQUE INDEX `StockCollaborator_STOCK_ID_USER_ID_key`(`STOCK_ID`, `USER_ID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `FamilyMember` ADD CONSTRAINT `FamilyMember_FAMILY_ID_fkey` FOREIGN KEY (`FAMILY_ID`) REFERENCES `Family`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FamilyMember` ADD CONSTRAINT `FamilyMember_USER_ID_fkey` FOREIGN KEY (`USER_ID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockCollaborator` ADD CONSTRAINT `StockCollaborator_STOCK_ID_fkey` FOREIGN KEY (`STOCK_ID`) REFERENCES `stocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockCollaborator` ADD CONSTRAINT `StockCollaborator_USER_ID_fkey` FOREIGN KEY (`USER_ID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockCollaborator` ADD CONSTRAINT `StockCollaborator_GRANTED_BY_fkey` FOREIGN KEY (`GRANTED_BY`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
