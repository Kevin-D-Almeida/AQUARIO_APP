import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { EquipmentRepository } from '../repositories/equipments.repository';
import { AquariumsRepository } from '../../aquariums/repositories/aquariums.repository';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly equipmentRepository: EquipmentRepository,
    private readonly aquariumsRepository: AquariumsRepository,
  ) {}

  async create(data: CreateEquipmentDto, userId: number) {
    const aquarium = await this.aquariumsRepository.findByIdAndUser(
      data.aquariumId,
      userId,
    );

    if (!aquarium) {
      throw new NotFoundException('Aquário não encontrado');
    }

    return this.equipmentRepository.create(data);
  }

  async findAll(userId: number) {
    return this.equipmentRepository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const equipment = await this.equipmentRepository.findByIdAndUser(
      id,
      userId,
    );

    if (!equipment) {
      throw new NotFoundException('Equipamento não encontrado');
    }

    return equipment;
  }

  async update(id: number, data: UpdateEquipmentDto, userId: number) {
    await this.findOne(id, userId);
    return this.equipmentRepository.update(id, data, userId);
  }

  async remove(id: number, userId: number) {
    const equipment = await this.findOne(id, userId);

    if (equipment.reminders.length > 0) {
      throw new ConflictException(
        'Não é possível excluir um equipamento que possui lembretes',
      );
    }

    return this.equipmentRepository.delete(id, userId);
  }
}
