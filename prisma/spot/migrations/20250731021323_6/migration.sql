/*
  Warnings:

  - You are about to drop the column `symbol` on the `OpenOrder` table. All the data in the column will be lost.
  - Added the required column `pairId` to the `OpenOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `OpenOrder_userId_symbol_status_idx` ON `OpenOrder`;

-- AlterTable
ALTER TABLE `OpenOrder` DROP COLUMN `symbol`,
    ADD COLUMN `pairId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `OpenOrder_userId_pairId_status_idx` ON `OpenOrder`(`userId`, `pairId`, `status`);

-- AddForeignKey
ALTER TABLE `OpenOrder` ADD CONSTRAINT `OpenOrder_pairId_fkey` FOREIGN KEY (`pairId`) REFERENCES `Pair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenOrder` ADD CONSTRAINT `OpenOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
