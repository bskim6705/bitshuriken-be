-- CreateTable
CREATE TABLE `Pair` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `baseAsset` VARCHAR(191) NOT NULL,
    `quoteAsset` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pair_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `symbol` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Balance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `currencyCode` VARCHAR(191) NOT NULL,
    `margin` DECIMAL(40, 18) NOT NULL,
    `available` DECIMAL(40, 18) NOT NULL,
    `locked` DECIMAL(40, 18) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Balance_userId_currencyCode_key`(`userId`, `currencyCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `pairId` INTEGER NOT NULL,
    `positionSide` ENUM('LONG', 'SHORT') NOT NULL,
    `positionStatus` ENUM('OPEN', 'CLOSED') NOT NULL,
    `qty` DECIMAL(40, 18) NOT NULL,
    `entryPrice` DECIMAL(40, 18) NOT NULL,
    `isolatedMargin` DECIMAL(40, 18) NOT NULL,
    `leverage` DECIMAL(40, 18) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_currencyCode_fkey` FOREIGN KEY (`currencyCode`) REFERENCES `Currency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Position` ADD CONSTRAINT `Position_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Position` ADD CONSTRAINT `Position_pairId_fkey` FOREIGN KEY (`pairId`) REFERENCES `Pair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
