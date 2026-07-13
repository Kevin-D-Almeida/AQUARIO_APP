import { Module } from '@nestjs/common';
import { MeasurementsController } from './measurement.controller';
import { MeasurementsService } from './application/measurements.service';
import { MeasurementsRepository } from './repositories/measurement.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { AquariumsModule } from '../aquariums/aquariums.module';

@Module({
  imports: [PrismaModule, AquariumsModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementsRepository],
})
export class MeasurementsModule {}