import { Injectable, NotFoundException } from '@nestjs/common';
import { AquariumsRepository } from '../../aquariums/repositories/aquariums.repository';
import { CreateMeasurementDto } from '../dto/create-measurement.dto';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';
import { MeasurementsRepository } from '../repositories/measurement.repository';

@Injectable()
export class MeasurementsService {
  constructor(
    private readonly measurementsRepository: MeasurementsRepository,
    private readonly aquariumsRepository: AquariumsRepository,
  ) {}

  async create(data: CreateMeasurementDto,userId:number) {
    const aquarium = await this.aquariumsRepository.findById(data.aquariumId,userId);

    if (!aquarium) {
      throw new NotFoundException('Aquário não encontrado');
    }

    return this.measurementsRepository.create(data);
  }

  async findAll(userId:number) {
    return this.measurementsRepository.findAll(userId);
  }

  async findOne(id: number) {
    const measurement = await this.measurementsRepository.findById(id);

    if (!measurement) {
      throw new NotFoundException('Medição não encontrada');
    }

    return measurement;
  }

  async findByAquariumId(aquariumId: number,userId:number) {
  const aquarium = await this.aquariumsRepository.findById(aquariumId,userId);

  if (!aquarium) {
    throw new NotFoundException('Aquário não encontrado');
  }

  return this.measurementsRepository.findByAquariumId(aquariumId);
}

  async update(id: number, data: UpdateMeasurementDto,userId:number) {
    await this.findOne(id);
    return this.measurementsRepository.update(id, data,userId);
  }

  async remove(id: number,userId:number) {
    await this.findOne(id);
    return this.measurementsRepository.delete(id,userId);
  }
}