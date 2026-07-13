/*
  Warnings:

  - Added the required column `updatedAt` to the `Aquarium` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Aquarium` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Aquarium` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Aquarium_userId_idx` ON `Aquarium`(`userId`);

-- AddForeignKey
ALTER TABLE `Aquarium` ADD CONSTRAINT `Aquarium_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
