import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './application/equipment.service';
import { EquipmentRepository } from './repositories/equipments.repository';
import { AquariumsModule } from '../aquariums/aquariums.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule ,AquariumsModule],
  controllers: [EquipmentController],
  providers: [EquipmentService, EquipmentRepository],
  exports: [EquipmentRepository]
})
export class EquipmentModule {}