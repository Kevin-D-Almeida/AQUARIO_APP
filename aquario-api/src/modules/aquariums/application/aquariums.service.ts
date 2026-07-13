import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAquariumDto } from '../dto/create-aquarium.dto';
import { UpdateAquariumDto } from '../dto/update-aquarium.dto';
import { AquariumCalculationService } from '../domain/aquarium-calculation.service';
import { AquariumsRepository } from '../repositories/aquariums.repository';

@Injectable()
export class AquariumsService {
  constructor(
    private readonly aquariumsRepository: AquariumsRepository,
    private readonly aquariumCalculationService: AquariumCalculationService,
  ) {}

  async create(data: CreateAquariumDto, userId: number) {
    const volumeLiters =
      this.aquariumCalculationService.calculateVolumeLiters(
        data.widthCm,
        data.heightCm,
        data.depthCm,
      );

    return this.aquariumsRepository.create({
      ...data,
      volumeLiters,
      userId,
    });
  }

  findAll(userId: number) {
    return this.aquariumsRepository.findByUser(userId);
  }

  async findOne(id: number, userId:number) {
    const aquarium = await this.aquariumsRepository.findById(id,userId);

    if (!aquarium) {
      throw new NotFoundException('Aquário não encontrado');
    }

    return aquarium;
  }

  async update(id: number, data: UpdateAquariumDto,userId:number) {
    await this.findOne(id,userId);

    const shouldRecalculateVolume =
      data.widthCm !== undefined &&
      data.heightCm !== undefined &&
      data.depthCm !== undefined;

    const volumeLiters = shouldRecalculateVolume
      ? this.aquariumCalculationService.calculateVolumeLiters(
          data.widthCm!,
          data.heightCm!,
          data.depthCm!,
        )
      : undefined;

    return this.aquariumsRepository.update(id, {
      ...data,
      ...(volumeLiters !== undefined && { volumeLiters }),
    },userId);
  }

  async remove(id: number,userId:number) {
    await this.findOne(id,userId);

    return this.aquariumsRepository.delete(id,userId);
  }
}