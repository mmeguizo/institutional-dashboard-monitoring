-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `visible_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `campus` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NULL DEFAULT '',
    `role` ENUM('ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'DIRECTOR', 'OFFICE_HEAD') NOT NULL DEFAULT 'OFFICE_HEAD',
    `department_id` VARCHAR(191) NULL,
    `vice_president_id` VARCHAR(191) NULL,
    `vice_president_name` VARCHAR(191) NULL,
    `director_id` VARCHAR(191) NULL,
    `director_name` VARCHAR(191) NULL,
    `office_head_id` VARCHAR(191) NULL,
    `office_head_name` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(191) NOT NULL,
    `profile_pic` VARCHAR(191) NOT NULL DEFAULT 'no-photo.png',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_visible_id_key`(`visible_id`),
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_deleted_role_idx`(`deleted`, `role`),
    INDEX `users_director_id_deleted_idx`(`director_id`, `deleted`),
    INDEX `users_vice_president_id_deleted_idx`(`vice_president_id`, `deleted`),
    INDEX `users_department_id_deleted_idx`(`department_id`, `deleted`),
    INDEX `users_status_deleted_idx`(`status`, `deleted`),
    INDEX `users_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `visible_id` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `department_head` VARCHAR(191) NOT NULL DEFAULT 'unassigned',
    `user_id` VARCHAR(191) NULL,
    `campus` VARCHAR(191) NOT NULL DEFAULT 'Talisay',
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_visible_id_key`(`visible_id`),
    UNIQUE INDEX `departments_department_key`(`department`),
    INDEX `departments_status_deleted_idx`(`status`, `deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campuses` (
    `id` VARCHAR(191) NOT NULL,
    `campus_name` VARCHAR(191) NOT NULL,
    `campus_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `campuses_campus_id_key`(`campus_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goallists` (
    `id` VARCHAR(191) NOT NULL,
    `visible_id` VARCHAR(191) NOT NULL,
    `goals` VARCHAR(191) NOT NULL,
    `date_added` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `goallists_visible_id_key`(`visible_id`),
    INDEX `goallists_deleted_idx`(`deleted`),
    INDEX `goallists_created_by_deleted_idx`(`created_by`, `deleted`),
    INDEX `goallists_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goallist_objectives` (
    `id` VARCHAR(191) NOT NULL,
    `visible_id` VARCHAR(191) NOT NULL,
    `objective` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `goallist_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `goallist_objectives_visible_id_key`(`visible_id`),
    INDEX `goallist_objectives_goallist_id_deleted_idx`(`goallist_id`, `deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goals` (
    `id` VARCHAR(191) NOT NULL,
    `visible_id` VARCHAR(191) NOT NULL,
    `goals` TEXT NOT NULL,
    `strategic_objective` TEXT NOT NULL,
    `strategic_id` VARCHAR(191) NOT NULL,
    `campus` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `budget` DECIMAL(15, 2) NULL,
    `date_added` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL,
    `goallists_id` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `update_date` DATETIME(3) NULL,
    `complete` BOOLEAN NOT NULL DEFAULT false,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `goals_visible_id_key`(`visible_id`),
    INDEX `goals_deleted_created_by_idx`(`deleted`, `created_by`),
    INDEX `goals_deleted_department_idx`(`deleted`, `department`),
    INDEX `goals_deleted_campus_idx`(`deleted`, `campus`),
    INDEX `goals_goallists_id_deleted_idx`(`goallists_id`, `deleted`),
    INDEX `goals_created_at_idx`(`created_at`),
    INDEX `goals_complete_deleted_idx`(`complete`, `deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `objective_budgets` (
    `id` VARCHAR(191) NOT NULL,
    `budget` DECIMAL(15, 2) NOT NULL,
    `goal_id` VARCHAR(191) NOT NULL,
    `objective_id` VARCHAR(191) NULL,

    INDEX `objective_budgets_goal_id_idx`(`goal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `objectives` (
    `id` VARCHAR(191) NOT NULL,
    `visible_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `goal_id` VARCHAR(191) NULL,
    `strategic_objective` TEXT NULL,
    `functional_objective` TEXT NULL,
    `performance_indicator` TEXT NULL,
    `target` INTEGER NULL,
    `formula` TEXT NULL,
    `programs` TEXT NULL,
    `responsible_persons` VARCHAR(191) NOT NULL,
    `clients` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `complete` BOOLEAN NOT NULL DEFAULT false,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `month_0` INTEGER NULL,
    `month_0_date` DATETIME(3) NULL,
    `month_1` INTEGER NULL,
    `month_1_date` DATETIME(3) NULL,
    `month_2` INTEGER NULL,
    `month_2_date` DATETIME(3) NULL,
    `month_3` INTEGER NULL,
    `month_3_date` DATETIME(3) NULL,
    `month_4` INTEGER NULL,
    `month_4_date` DATETIME(3) NULL,
    `month_5` INTEGER NULL,
    `month_5_date` DATETIME(3) NULL,
    `month_6` INTEGER NULL,
    `month_6_date` DATETIME(3) NULL,
    `month_7` INTEGER NULL,
    `month_7_date` DATETIME(3) NULL,
    `month_8` INTEGER NULL,
    `month_8_date` DATETIME(3) NULL,
    `month_9` INTEGER NULL,
    `month_9_date` DATETIME(3) NULL,
    `month_10` INTEGER NULL,
    `month_10_date` DATETIME(3) NULL,
    `month_11` INTEGER NULL,
    `month_11_date` DATETIME(3) NULL,
    `goal_month_0` INTEGER NULL,
    `goal_month_0_date` DATETIME(3) NULL,
    `goal_month_1` INTEGER NULL,
    `goal_month_1_date` DATETIME(3) NULL,
    `goal_month_2` INTEGER NULL,
    `goal_month_2_date` DATETIME(3) NULL,
    `goal_month_3` INTEGER NULL,
    `goal_month_3_date` DATETIME(3) NULL,
    `goal_month_4` INTEGER NULL,
    `goal_month_4_date` DATETIME(3) NULL,
    `goal_month_5` INTEGER NULL,
    `goal_month_5_date` DATETIME(3) NULL,
    `goal_month_6` INTEGER NULL,
    `goal_month_6_date` DATETIME(3) NULL,
    `goal_month_7` INTEGER NULL,
    `goal_month_7_date` DATETIME(3) NULL,
    `goal_month_8` INTEGER NULL,
    `goal_month_8_date` DATETIME(3) NULL,
    `goal_month_9` INTEGER NULL,
    `goal_month_9_date` DATETIME(3) NULL,
    `goal_month_10` INTEGER NULL,
    `goal_month_10_date` DATETIME(3) NULL,
    `goal_month_11` INTEGER NULL,
    `goal_month_11_date` DATETIME(3) NULL,
    `file_month_0` VARCHAR(191) NULL,
    `file_month_0_date` DATETIME(3) NULL,
    `file_month_1` VARCHAR(191) NULL,
    `file_month_1_date` DATETIME(3) NULL,
    `file_month_2` VARCHAR(191) NULL,
    `file_month_2_date` DATETIME(3) NULL,
    `file_month_3` VARCHAR(191) NULL,
    `file_month_3_date` DATETIME(3) NULL,
    `file_month_4` VARCHAR(191) NULL,
    `file_month_4_date` DATETIME(3) NULL,
    `file_month_5` VARCHAR(191) NULL,
    `file_month_5_date` DATETIME(3) NULL,
    `file_month_6` VARCHAR(191) NULL,
    `file_month_6_date` DATETIME(3) NULL,
    `file_month_7` VARCHAR(191) NULL,
    `file_month_7_date` DATETIME(3) NULL,
    `file_month_8` VARCHAR(191) NULL,
    `file_month_8_date` DATETIME(3) NULL,
    `file_month_9` VARCHAR(191) NULL,
    `file_month_9_date` DATETIME(3) NULL,
    `file_month_10` VARCHAR(191) NULL,
    `file_month_10_date` DATETIME(3) NULL,
    `file_month_11` VARCHAR(191) NULL,
    `file_month_11_date` DATETIME(3) NULL,

    UNIQUE INDEX `objectives_visible_id_key`(`visible_id`),
    INDEX `objectives_deleted_user_id_idx`(`deleted`, `user_id`),
    INDEX `objectives_goal_id_deleted_idx`(`goal_id`, `deleted`),
    INDEX `objectives_created_by_deleted_idx`(`created_by`, `deleted`),
    INDEX `objectives_complete_deleted_idx`(`complete`, `deleted`),
    INDEX `objectives_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `file_uploads` (
    `id` VARCHAR(191) NOT NULL,
    `visible_id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(255) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `for_field` VARCHAR(50) NOT NULL,
    `date_added` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` BOOLEAN NOT NULL DEFAULT true,
    `filetype` VARCHAR(191) NULL DEFAULT '',
    `objective_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `file_month_0` VARCHAR(191) NULL,
    `file_month_1` VARCHAR(191) NULL,
    `file_month_2` VARCHAR(191) NULL,
    `file_month_3` VARCHAR(191) NULL,
    `file_month_4` VARCHAR(191) NULL,
    `file_month_5` VARCHAR(191) NULL,
    `file_month_6` VARCHAR(191) NULL,
    `file_month_7` VARCHAR(191) NULL,
    `file_month_8` VARCHAR(191) NULL,
    `file_month_9` VARCHAR(191) NULL,
    `file_month_10` VARCHAR(191) NULL,
    `file_month_11` VARCHAR(191) NULL,
    `file_quarter_0` VARCHAR(191) NULL,
    `file_quarter_1` VARCHAR(191) NULL,
    `file_quarter_2` VARCHAR(191) NULL,
    `file_quarter_3` VARCHAR(191) NULL,
    `file_semi_annual_0` VARCHAR(191) NULL,
    `file_semi_annual_1` VARCHAR(191) NULL,
    `file_semi_annual_2` VARCHAR(191) NULL,
    `file_yearly_0` VARCHAR(191) NULL,

    UNIQUE INDEX `file_uploads_visible_id_key`(`visible_id`),
    INDEX `file_uploads_user_id_objective_id_idx`(`user_id`, `objective_id`),
    INDEX `file_uploads_objective_id_status_idx`(`objective_id`, `status`),
    INDEX `file_uploads_date_added_idx`(`date_added`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `recipient_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `type` VARCHAR(191) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `goal_details` JSON NULL,
    `objective_details` JSON NULL,
    `user_details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `notifications_recipient_id_is_read_idx`(`recipient_id`, `is_read`),
    INDEX `notifications_created_at_idx`(`created_at`),
    INDEX `notifications_type_user_id_idx`(`type`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `remarks` (
    `id` VARCHAR(191) NOT NULL,
    `remarks` TEXT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `objective_id` VARCHAR(191) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `remarks_objective_id_deleted_idx`(`objective_id`, `deleted`),
    INDEX `remarks_user_id_deleted_idx`(`user_id`, `deleted`),
    INDEX `remarks_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NULL,
    `params` JSON NULL,
    `query` JSON NULL,
    `url` VARCHAR(500) NULL,
    `body` JSON NULL,
    `status` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `status_code` INTEGER NULL,
    `ip` VARCHAR(191) NULL,
    `user` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `logs_date_idx`(`date`),
    INDEX `logs_user_date_idx`(`user`, `date`),
    INDEX `logs_url_date_idx`(`url`, `date`),
    INDEX `logs_deleted_idx`(`deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_histories` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activity_type` VARCHAR(191) NULL,
    `activity_url` VARCHAR(500) NULL,
    `activity_data` JSON NULL,
    `activity_action` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_histories_user_id_timestamp_idx`(`user_id`, `timestamp`),
    INDEX `user_histories_activity_type_timestamp_idx`(`activity_type`, `timestamp`),
    INDEX `user_histories_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_chats` (
    `id` VARCHAR(191) NOT NULL,
    `chat_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `prompt` TEXT NULL,
    `response_ai` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_chats_user_id_idx`(`user_id`),
    INDEX `ai_chats_chat_id_idx`(`chat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goallist_objectives` ADD CONSTRAINT `goallist_objectives_goallist_id_fkey` FOREIGN KEY (`goallist_id`) REFERENCES `goallists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goals` ADD CONSTRAINT `goals_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goals` ADD CONSTRAINT `goals_goallists_id_fkey` FOREIGN KEY (`goallists_id`) REFERENCES `goallists`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goals` ADD CONSTRAINT `goals_department_fkey` FOREIGN KEY (`department`) REFERENCES `departments`(`department`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `objective_budgets` ADD CONSTRAINT `objective_budgets_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `objectives` ADD CONSTRAINT `objectives_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `objectives` ADD CONSTRAINT `objectives_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `file_uploads` ADD CONSTRAINT `file_uploads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `file_uploads` ADD CONSTRAINT `file_uploads_objective_id_fkey` FOREIGN KEY (`objective_id`) REFERENCES `objectives`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `remarks` ADD CONSTRAINT `remarks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `remarks` ADD CONSTRAINT `remarks_objective_id_fkey` FOREIGN KEY (`objective_id`) REFERENCES `objectives`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_histories` ADD CONSTRAINT `user_histories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_chats` ADD CONSTRAINT `ai_chats_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
