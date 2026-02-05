/*
  Warnings:

  - A unique constraint covering the columns `[visible_id]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - The required column `visible_id` was added to the `notifications` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `visible_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `notifications_visible_id_key` ON `notifications`(`visible_id`);
