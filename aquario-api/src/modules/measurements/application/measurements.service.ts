import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(data: CreateMeasurementDto, userId: number) {
    const aquarium = await this.aquariumsRepository.findById(
      data.aquariumId,
      userId,
    );

    if (!aquarium) {
      throw new NotFoundException('Aquário não encontrado');
    }

    await this.validateDevice(data.deviceId, data.aquariumId, userId);

    return this.measurementsRepository.create(data);
  }

  findAll(userId: number) {
    return this.measurementsRepository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const measurement = await this.measurementsRepository.findById(id, userId);

    if (!measurement) {
      throw new NotFoundException('Medição não encontrada');
    }

    return measurement;
  }

  async findByAquariumId(aquariumId: number, userId: number) {
    const aquarium = await this.aquariumsRepository.findById(
      aquariumId,
      userId,
    );

    if (!aquarium) {
      throw new NotFoundException('Aquário não encontrado');
    }

    return this.measurementsRepository.findByAquariumId(aquariumId);
  }

  async update(id: number, data: UpdateMeasurementDto, userId: number) {
    const measurement = await this.findOne(id, userId);
    const aquariumId = data.aquariumId ?? measurement.aquariumId;

    if (data.aquariumId !== undefined) {
      const aquarium = await this.aquariumsRepository.findById(
        aquariumId,
        userId,
      );

      if (!aquarium) {
        throw new NotFoundException('Aquário não encontrado');
      }
    }

    const deviceId = data.deviceId ?? measurement.deviceId;
    await this.validateDevice(deviceId ?? undefined, aquariumId, userId);

    return this.measurementsRepository.update(id, data, userId);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.measurementsRepository.delete(id, userId);
  }

  private async validateDevice(
    deviceId: number | undefined,
    aquariumId: number,
    userId: number,
  ) {
    if (deviceId === undefined) {
      return;
    }

    const device = await this.measurementsRepository.findDeviceByIdAndUser(
      deviceId,
      userId,
    );

    if (!device) {
      throw new NotFoundException('Dispositivo não encontrado');
    }

    if (device.aquariumId !== aquariumId) {
      throw new BadRequestException(
        'O dispositivo não pertence ao aquário selecionado',
      );
    }
  }
}
