/*
  Warnings:

  - You are about to drop the `WalletBalance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `WalletBalance` DROP FOREIGN KEY `WalletBalance_currencyCode_fkey`;

-- DropForeignKey
ALTER TABLE `WalletBalance` DROP FOREIGN KEY `WalletBalance_userId_fkey`;

-- DropTable
DROP TABLE `WalletBalance`;

-- CreateTable
CREATE TABLE `Balance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `currencyCode` VARCHAR(191) NOT NULL,
    `available` DECIMAL(40, 18) NOT NULL,
    `locked` DECIMAL(40, 18) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Balance_userId_currencyCode_key`(`userId`, `currencyCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_currencyCode_fkey` FOREIGN KEY (`currencyCode`) REFERENCES `Currency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;
