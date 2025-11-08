/*
  Warnings:

  - Added the required column `unrealizedPnl` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Position` ADD COLUMN `unrealizedPnl` DECIMAL(40, 18) NOT NULL;

-- CreateTable
CREATE TABLE `OpenOrder` (
    `orderId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `pairId` INTEGER NOT NULL,
    `side` ENUM('BUY', 'SELL') NOT NULL,
    `type` ENUM('LIMIT', 'MARKET') NOT NULL,
    `price` DECIMAL(40, 18) NULL,
    `qty` DECIMAL(40, 18) NOT NULL,
    `remaining` DECIMAL(40, 18) NOT NULL,
    `status` ENUM('OPEN', 'PARTIAL', 'FILLED', 'CANCELED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpenOrder_userId_pairId_status_idx`(`userId`, `pairId`, `status`),
    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OpenOrder` ADD CONSTRAINT `OpenOrder_pairId_fkey` FOREIGN KEY (`pairId`) REFERENCES `Pair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpenOrder` ADD CONSTRAINT `OpenOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
