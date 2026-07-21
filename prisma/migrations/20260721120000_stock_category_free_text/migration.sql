-- AlterTable
-- Replace the native `ENUM('alimentation','hygiene','artistique')` column with
-- free text (max 50 chars) so users aren't limited to the 3 predefined
-- categories. Existing values are valid ENUM members and convert to the
-- equivalent VARCHAR values automatically.
ALTER TABLE `stocks` MODIFY COLUMN `category` VARCHAR(50) NOT NULL DEFAULT 'alimentation';
