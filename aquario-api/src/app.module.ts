import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AquariumsModule } from './modules/aquariums/aquariums.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { MaintenanceRemindersModule } from './modules/maintenance-reminders/maintenance-reminders.module';
import { MeasurementsModule } from './modules/measurements/measurement.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, UsersModule, AquariumsModule, EquipmentModule, MaintenanceRemindersModule, MeasurementsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
