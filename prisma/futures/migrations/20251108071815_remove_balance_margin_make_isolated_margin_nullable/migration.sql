/*
  Warnings:

  - You are about to drop the column `margin` on the `Balance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,pairId,positionSide]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Balance` DROP COLUMN `margin`;

-- AlterTable
ALTER TABLE `Position` MODIFY `isolatedMargin` DECIMAL(40, 18) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Position_userId_pairId_positionSide_key` ON `Position`(`userId`, `pairId`, `positionSide`);
