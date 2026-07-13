import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaintenanceReminderDto } from '../dto/create-maintenance-reminder.dto';
import { UpdateMaintenanceReminderDto } from '../dto/update-maintenance-reminder.dto';
import { MaintenanceReminderRepository } from '../repositories/maintenance-reminders.repository';
import { AquariumsRepository } from 'src/modules/aquariums/repositories/aquariums.repository';
import { EquipmentRepository } from 'src/modules/equipment/repositories/equipments.repository';

@Injectable()
export class MaintenanceRemindersService {
  constructor(
    private readonly aquariumsRepository: AquariumsRepository,
    private readonly maintenanceReminderRepository: MaintenanceReminderRepository,
    private readonly equipmentRepository: EquipmentRepository,
  ) {}

  async create(data: CreateMaintenanceReminderDto, userId: number) {
    const aquarium = await this.aquariumsRepository.findByIdAndUser(data.aquariumId,userId)
    if (!aquarium) {
      throw new NotFoundException('Aquário não encontrado');
    }

    if (data.equipmentId) {
      const equipment = await this.equipmentRepository.findByIdAndUser(data.equipmentId,userId)

      if (!equipment) {
        throw new NotFoundException('Equipamento não encontrado');
      }
    }

    return this.maintenanceReminderRepository.create(data)
  }

  async findAll(userId:number) {
    return this.maintenanceReminderRepository.findAll(userId)
  }

  async findOne(id: number,userId: number) {
    const reminder = await this.maintenanceReminderRepository.findByIdAndUser(id,userId)

    if (!reminder) {
      throw new NotFoundException('Lembrete não encontrado');
    }
    return reminder;
  }

  async update(id: number, data: UpdateMaintenanceReminderDto, userId:number) {
    await this.findOne(id,userId);

    return this.maintenanceReminderRepository.update(id,data,userId)
  }

  async markAsDone(id: number,userId:number) {
    await this.findOne(id,userId);
    return this.maintenanceReminderRepository.markAsDone(id,userId)
  }

  async remove(id: number,userId:number) {
    await this.findOne(id,userId);
    return this.maintenanceReminderRepository.delete(id,userId)
  }
}