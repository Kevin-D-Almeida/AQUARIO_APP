import { Module } from '@nestjs/common';
import { MaintenanceRemindersService } from './application/maintenance-reminders.service';
import { MaintenanceRemindersController } from './maintenance-reminders.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MaintenanceReminderRepository } from './repositories/maintenance-reminders.repository';
import { AquariumsModule } from '../aquariums/aquariums.module';
import { EquipmentModule } from '../equipment/equipment.module';

@Module({
  imports: [PrismaModule, AquariumsModule, EquipmentModule],
  controllers: [MaintenanceRemindersController],
  providers: [MaintenanceRemindersService, MaintenanceReminderRepository],
})
export class MaintenanceRemindersModule {}
