/*
  Warnings:

  - You are about to drop the column `campus_id` on the `campuses` table. All the data in the column will be lost.
  - You are about to alter the column `target` on the `objectives` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - A unique constraint covering the columns `[visible_id]` on the table `campuses` will be added. If there are existing duplicate values, this will fail.
  - The required column `visible_id` was added to the `campuses` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX `campuses_campus_id_key` ON `campuses`;

-- AlterTable
ALTER TABLE `campuses` DROP COLUMN `campus_id`,
    ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `visible_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `objectives` ADD COLUMN `budget` DECIMAL(15, 2) NULL,
    ADD COLUMN `data_source` VARCHAR(191) NULL,
    ADD COLUMN `date_added` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `frequency_monitoring` VARCHAR(191) NULL DEFAULT 'monthly',
    ADD COLUMN `goal_visible_id` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'active',
    ADD COLUMN `timetable` DATETIME(3) NULL,
    ADD COLUMN `type_of_computation` VARCHAR(191) NULL DEFAULT 'non-cumulative',
    ADD COLUMN `update_by` VARCHAR(191) NULL,
    ADD COLUMN `update_date` DATETIME(3) NULL,
    MODIFY `target` DOUBLE NULL,
    MODIFY `responsible_persons` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `campuses_visible_id_key` ON `campuses`(`visible_id`);

-- CreateIndex
CREATE INDEX `campuses_deleted_idx` ON `campuses`(`deleted`);
