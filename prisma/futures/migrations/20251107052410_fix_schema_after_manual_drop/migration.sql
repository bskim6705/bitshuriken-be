/*
  Warnings:

  - You are about to drop the column `currencyCode` on the `Balance` table. All the data in the column will be lost.
  - You are about to drop the column `baseAsset` on the `Pair` table. All the data in the column will be lost.
  - You are about to drop the column `quoteAsset` on the `Pair` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,marginCurrencyCode]` on the table `Balance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `marginCurrencyCode` to the `Balance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountPrecision` to the `Pair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseCurrencyCode` to the `Pair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePrecision` to the `Pair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteCurrencyCode` to the `Pair` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Balance` DROP FOREIGN KEY `Balance_currencyCode_fkey`;

-- DropForeignKey
ALTER TABLE `Balance` DROP FOREIGN KEY `Balance_userId_fkey`;

-- DropIndex
DROP INDEX `Balance_currencyCode_fkey` ON `Balance`;

-- DropIndex
DROP INDEX `Balance_userId_currencyCode_key` ON `Balance`;

-- AlterTable
ALTER TABLE `Balance` DROP COLUMN `currencyCode`,
    ADD COLUMN `marginCurrencyCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Pair` DROP COLUMN `baseAsset`,
    DROP COLUMN `quoteAsset`,
    ADD COLUMN `amountPrecision` INTEGER NOT NULL,
    ADD COLUMN `baseCurrencyCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `pricePrecision` INTEGER NOT NULL,
    ADD COLUMN `quoteCurrencyCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `password`;

-- CreateTable
CREATE TABLE `MarginCurrency` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `symbol` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Balance_userId_marginCurrencyCode_key` ON `Balance`(`userId`, `marginCurrencyCode`);

-- AddForeignKey
ALTER TABLE `Pair` ADD CONSTRAINT `Pair_baseCurrencyCode_fkey` FOREIGN KEY (`baseCurrencyCode`) REFERENCES `Currency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pair` ADD CONSTRAINT `Pair_quoteCurrencyCode_fkey` FOREIGN KEY (`quoteCurrencyCode`) REFERENCES `MarginCurrency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Balance` ADD CONSTRAINT `Balance_marginCurrencyCode_fkey` FOREIGN KEY (`marginCurrencyCode`) REFERENCES `MarginCurrency`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;
