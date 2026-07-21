-- AlterTable
-- Add a free-text `note` field on items (max 1000 chars), optional, for
-- users to jot down arbitrary information about a specific item.
ALTER TABLE `items` ADD COLUMN `note` VARCHAR(1000) NULL;
