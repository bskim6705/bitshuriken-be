-- AlterTable
ALTER TABLE `User` ADD COLUMN `assetMode` ENUM('SINGLE_ASSET', 'MULTI_ASSET') NOT NULL DEFAULT 'SINGLE_ASSET',
    ADD COLUMN `positionMode` ENUM('ONE_WAY', 'HEDGE') NOT NULL DEFAULT 'ONE_WAY';

-- CreateTable
CREATE TABLE `PositionSetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `pairId` INTEGER NOT NULL,
    `marginMode` ENUM('ISOLATED', 'CROSS') NOT NULL DEFAULT 'CROSS',
    `leverage` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,

    UNIQUE INDEX `PositionSetting_userId_pairId_key`(`userId`, `pairId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PositionSetting` ADD CONSTRAINT `PositionSetting_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PositionSetting` ADD CONSTRAINT `PositionSetting_pairId_fkey` FOREIGN KEY (`pairId`) REFERENCES `Pair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
