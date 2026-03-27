-- AlterTable
ALTER TABLE `stock_predictions`
  ADD COLUMN `aiSuggestions` JSON NULL,
  ADD COLUMN `aiGeneratedAt` DATETIME(3) NULL;
