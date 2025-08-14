-- CreateTable
CREATE TABLE `OpenOrder` (
    `orderId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `side` ENUM('BUY', 'SELL') NOT NULL,
    `type` ENUM('LIMIT', 'MARKET') NOT NULL,
    `price` DECIMAL(40, 18) NULL,
    `qty` DECIMAL(40, 18) NOT NULL,
    `remaining` DECIMAL(40, 18) NOT NULL,
    `status` ENUM('OPEN', 'PARTIAL', 'FILLED', 'CANCELED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OpenOrder_userId_symbol_status_idx`(`userId`, `symbol`, `status`),
    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
