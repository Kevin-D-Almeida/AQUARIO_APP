import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MeasurementsService } from './application/measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  create(
    @Body() body: CreateMeasurementDto,
    @CurrentUser("id") userId: number
  ) {
    return this.measurementsService.create(body,userId);
  }

  @Get()
  findAll(@CurrentUser("id")userId:number) {
    return this.measurementsService.findAll(userId);
  }

  @Get('aquarium/:aquariumId')
findByAquariumId(
  @Param('aquariumId', ParseIntPipe) aquariumId: number,
  @CurrentUser("id") userId:number
) {
  return this.measurementsService.findByAquariumId(aquariumId,userId);
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.measurementsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMeasurementDto,
    @CurrentUser("id") userId:number
  ) {
    return this.measurementsService.update(id, body,userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser("id") userId:number
  ) {
    return this.measurementsService.remove(id,userId);
  }
}