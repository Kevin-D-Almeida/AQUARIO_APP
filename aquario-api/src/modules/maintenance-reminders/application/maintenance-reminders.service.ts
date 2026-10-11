import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMaintenanceReminderDto } from '../dto/create-maintenance-reminder.dto';
import { UpdateMaintenanceReminderDto } from '../dto/update-maintenance-reminder.dto';
import { MaintenanceReminderRepository } from '../repositories/maintenance-reminders.repository';
import { AquariumsRepository } from '../../aquariums/repositories/aquariums.repository';
import { EquipmentRepository } from '../../equipment/repositories/equipments.repository';

export function isSameLocalCalendarDay(
  first: Date,
  second: Date,
  timezoneOffsetMinutes: number,
) {
  const toLocalDateKey = (date: Date) =>
    new Date(date.getTime() - timezoneOffsetMinutes * 60_000)
      .toISOString()
      .slice(0, 10);

  return toLocalDateKey(first) === toLocalDateKey(second);
}

@Injectable()
export class MaintenanceRemindersService {
  constructor(
    private readonly aquariumsRepository: AquariumsRepository,
    private readonly maintenanceReminderRepository: MaintenanceReminderRepository,
    private readonly equipmentRepository: EquipmentRepository,
  ) {}

  async create(data: CreateMaintenanceReminderDto, userId: number) {
    const aquarium = await this.aquariumsRepository.findByIdAndUser(
      data.aquariumId,
      userId,
    );
    if (!aquarium) {
      throw new NotFoundException('Aquário não encontrado');
    }

    if (data.equipmentId) {
      const equipment = await this.equipmentRepository.findByIdAndUser(
        data.equipmentId,
        userId,
      );

      if (!equipment) {
        throw new NotFoundException('Equipamento não encontrado');
      }

      if (equipment.aquariumId !== data.aquariumId) {
        throw new BadRequestException(
          'O equipamento informado não pertence ao aquário selecionado',
        );
      }
    }

    return this.maintenanceReminderRepository.create(data);
  }

  async findAll(userId: number) {
    return this.maintenanceReminderRepository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const reminder = await this.maintenanceReminderRepository.findByIdAndUser(
      id,
      userId,
    );

    if (!reminder) {
      throw new NotFoundException('Lembrete não encontrado');
    }
    return reminder;
  }

  async update(id: number, data: UpdateMaintenanceReminderDto, userId: number) {
    const reminder = await this.findOne(id, userId);

    const aquariumId = data.aquariumId ?? reminder.aquariumId;

    if (data.aquariumId !== undefined) {
      const aquarium = await this.aquariumsRepository.findByIdAndUser(
        aquariumId,
        userId,
      );

      if (!aquarium) {
        throw new NotFoundException('Aquário não encontrado');
      }
    }

    const equipmentId = data.equipmentId ?? reminder.equipmentId;

    if (equipmentId) {
      const equipment = await this.equipmentRepository.findByIdAndUser(
        equipmentId,
        userId,
      );

      if (!equipment) {
        throw new NotFoundException('Equipamento não encontrado');
      }

      if (equipment.aquariumId !== aquariumId) {
        throw new BadRequestException(
          'O equipamento informado não pertence ao aquário selecionado',
        );
      }
    }

    return this.maintenanceReminderRepository.update(id, data, userId);
  }

  async markAsDone(id: number, userId: number, timezoneOffsetMinutes: number) {
    const reminder = await this.findOne(id, userId);

    if (reminder.status === 'DONE') {
      throw new BadRequestException('Este lembrete já foi concluído');
    }

    const isScheduledForToday = isSameLocalCalendarDay(
      reminder.dueDate,
      new Date(),
      timezoneOffsetMinutes,
    );

    if (!isScheduledForToday) {
      throw new BadRequestException(
        'Esta atividade só pode ser concluída no dia agendado',
      );
    }

    return this.maintenanceReminderRepository.markAsDone(id, userId);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.maintenanceReminderRepository.delete(id, userId);
  }
}
