/*
  Warnings:

  - You are about to drop the column `liters` on the `Aquarium` table. All the data in the column will be lost.
  - Added the required column `depthCm` to the `Aquarium` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heightCm` to the `Aquarium` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Aquarium` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volumeLiters` to the `Aquarium` table without a default value. This is not possible if the table is not empty.
  - Added the required column `widthCm` to the `Aquarium` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Aquarium` DROP COLUMN `liters`,
    ADD COLUMN `depthCm` DOUBLE NOT NULL,
    ADD COLUMN `heightCm` DOUBLE NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `setupDate` DATETIME(3) NULL,
    ADD COLUMN `type` ENUM('FRESHWATER', 'MARINE', 'BRACKISH', 'PLANTED', 'BLACKWATER') NOT NULL,
    ADD COLUMN `volumeLiters` DOUBLE NOT NULL,
    ADD COLUMN `widthCm` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `Equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FILTER_HANG_ON', 'FILTER_CANISTER', 'FILTER_INTERNAL', 'FILTER_SPONGE', 'SUMP', 'HEATER', 'LIGHTING', 'CO2', 'UV_FILTER', 'AIR_PUMP', 'OTHER') NOT NULL,
    `brand` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `biologicalCapacityLiters` DOUBLE NULL,
    `maintenanceIntervalDays` INTEGER NULL,
    `installedAt` DATETIME(3) NULL,
    `lastMaintenanceAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aquariumId` INTEGER NOT NULL,

    INDEX `Equipment_aquariumId_idx`(`aquariumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintenanceReminder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('WATER_CHANGE', 'FILTER_CLEANING', 'MEDIA_REPLACEMENT', 'FEEDING', 'FERTILIZATION', 'SENSOR_CALIBRATION', 'OTHER') NOT NULL,
    `status` ENUM('PENDING', 'DONE', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `dueDate` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aquariumId` INTEGER NOT NULL,
    `equipmentId` INTEGER NULL,

    INDEX `MaintenanceReminder_aquariumId_idx`(`aquariumId`),
    INDEX `MaintenanceReminder_equipmentId_idx`(`equipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IoTDevice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `deviceCode` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `aquariumId` INTEGER NOT NULL,

    UNIQUE INDEX `IoTDevice_deviceCode_key`(`deviceCode`),
    INDEX `IoTDevice_aquariumId_idx`(`aquariumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SensorReading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('WATER_LEVEL', 'TEMPERATURE', 'PH') NOT NULL,
    `value` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `measuredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aquariumId` INTEGER NOT NULL,
    `deviceId` INTEGER NULL,

    INDEX `SensorReading_aquariumId_idx`(`aquariumId`),
    INDEX `SensorReading_deviceId_idx`(`deviceId`),
    INDEX `SensorReading_type_idx`(`type`),
    INDEX `SensorReading_measuredAt_idx`(`measuredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_aquariumId_fkey` FOREIGN KEY (`aquariumId`) REFERENCES `Aquarium`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceReminder` ADD CONSTRAINT `MaintenanceReminder_aquariumId_fkey` FOREIGN KEY (`aquariumId`) REFERENCES `Aquarium`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceReminder` ADD CONSTRAINT `MaintenanceReminder_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IoTDevice` ADD CONSTRAINT `IoTDevice_aquariumId_fkey` FOREIGN KEY (`aquariumId`) REFERENCES `Aquarium`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SensorReading` ADD CONSTRAINT `SensorReading_aquariumId_fkey` FOREIGN KEY (`aquariumId`) REFERENCES `Aquarium`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SensorReading` ADD CONSTRAINT `SensorReading_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `IoTDevice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
