/*
  Warnings:

  - You are about to drop the `SensorReading` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `SensorReading` DROP FOREIGN KEY `SensorReading_aquariumId_fkey`;

-- DropForeignKey
ALTER TABLE `SensorReading` DROP FOREIGN KEY `SensorReading_deviceId_fkey`;

-- DropTable
DROP TABLE `SensorReading`;

-- CreateTable
CREATE TABLE `Measurement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('TEMPERATURE', 'PH', 'WATER_LEVEL', 'AMMONIA', 'NITRITE', 'NITRATE', 'GH', 'KH', 'TDS', 'CONDUCTIVITY') NOT NULL,
    `source` ENUM('MANUAL', 'IOT') NOT NULL DEFAULT 'MANUAL',
    `value` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `measuredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` VARCHAR(191) NULL,
    `aquariumId` INTEGER NOT NULL,
    `deviceId` INTEGER NULL,

    INDEX `Measurement_aquariumId_idx`(`aquariumId`),
    INDEX `Measurement_deviceId_idx`(`deviceId`),
    INDEX `Measurement_type_idx`(`type`),
    INDEX `Measurement_measuredAt_idx`(`measuredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Measurement` ADD CONSTRAINT `Measurement_aquariumId_fkey` FOREIGN KEY (`aquariumId`) REFERENCES `Aquarium`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Measurement` ADD CONSTRAINT `Measurement_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `IoTDevice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
