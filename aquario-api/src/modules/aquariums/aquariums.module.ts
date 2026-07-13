import { Module } from '@nestjs/common';
import { AquariumsController } from './aquariums.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AquariumsService } from './application/aquariums.service';
import { AquariumCalculationService } from './domain/aquarium-calculation.service';
import { AquariumsRepository } from './repositories/aquariums.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AquariumsController],
  providers: [
    AquariumsService,
    AquariumCalculationService,
    AquariumsRepository,
  ],
  exports:[AquariumsRepository]
})
export class AquariumsModule {}