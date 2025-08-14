-- CreateTable
CREATE TABLE `Currency` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `symbol` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pair` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `baseCurrencyCode` VARCHAR(191) NOT NULL,
    `quoteCurrencyCode` VARCHAR(191) NOT NULL,
    `pricePrecision` INTEGER NOT NULL,
    `amountPrecision` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pair_symbol_key`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WalletBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `currencyCode` VARCHAR(191) NOT NULL,
    `available` DECIMAL(40, 18) NOT NULL,
    `locked` DECIMAL(40, 18) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WalletBalance_userId_currencyCode_key`(`userId`, `currencyCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeFeeDefault` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pairId` INTEGER NOT NULL,
    `makerRate` DECIMAL(10, 5) NOT NULL,
    `takerRate` DECIMAL(10, 5) NOT NULL,

    UNIQUE INDEX `TradeFeeDefault_pairId_key`(`pairId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeFee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `pairId` INTEGER NOT NULL,
    `makerRate` DECIMAL(10, 5) NOT NULL,
    `takerRate` DECIMAL(10, 5) NOT NULL,

    UNIQUE INDEX `TradeFee_userId_pairId_key`(`userId`, `pairId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pair` ADD CONSTRAINT `Pair_baseCurrencyCode_fkey` FOREIGN KEY (`baseCurrencyCode`) REFERENCES `Currency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pair` ADD CONSTRAINT `Pair_quoteCurrencyCode_fkey` FOREIGN KEY (`quoteCurrencyCode`) REFERENCES `Currency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WalletBalance` ADD CONSTRAINT `WalletBalance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WalletBalance` ADD CONSTRAINT `WalletBalance_currencyCode_fkey` FOREIGN KEY (`currencyCode`) REFERENCES `Currency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeFeeDefault` ADD CONSTRAINT `TradeFeeDefault_pairId_fkey` FOREIGN KEY (`pairId`) REFERENCES `Pair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeFee` ADD CONSTRAINT `TradeFee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradeFee` ADD CONSTRAINT `TradeFee_pairId_fkey` FOREIGN KEY (`pairId`) REFERENCES `Pair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
