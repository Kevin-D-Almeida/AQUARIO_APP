import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMaintenanceReminderDto } from '../dto/create-maintenance-reminder.dto';
import { UpdateMaintenanceReminderDto } from '../dto/update-maintenance-reminder.dto';
import { ReminderStatus } from '@prisma/client';

@Injectable()
export class MaintenanceReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateMaintenanceReminderDto) {
    return this.prisma.maintenanceReminder.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.maintenanceReminder.findMany({
      where: {
        aquarium: { userId },
      },
      include: {
        aquarium: true,
        equipment: true,
      },
    });
  }

  findByIdAndUser(id: number, userId: number) {
    return this.prisma.maintenanceReminder.findUnique({
      where: {
        id,
        aquarium: { userId },
      },
      include: {
        aquarium: true,
        equipment: true,
      },
    });
  }

  update(id: number, data: UpdateMaintenanceReminderDto, userId: number) {
    return this.prisma.maintenanceReminder.update({
      where: {
        id,
        aquarium: { userId },
      },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  markAsDone(id: number, userId: number) {
    return this.prisma.$transaction(async (transaction) => {
      const reminder = await transaction.maintenanceReminder.findUniqueOrThrow({
        where: {
          id,
          aquarium: { userId },
        },
      });

      const completedReminder = await transaction.maintenanceReminder.update({
        where: { id },
        data: {
          status: ReminderStatus.DONE,
          completedAt: new Date(),
        },
      });

      if (reminder.repeatEveryDays) {
        const nextDueDate = new Date(reminder.dueDate);
        const now = new Date();

        do {
          nextDueDate.setUTCDate(
            nextDueDate.getUTCDate() + reminder.repeatEveryDays,
          );
        } while (nextDueDate <= now);

        await transaction.maintenanceReminder.create({
          data: {
            title: reminder.title,
            description: reminder.description,
            type: reminder.type,
            dueDate: nextDueDate,
            aquariumId: reminder.aquariumId,
            equipmentId: reminder.equipmentId,
            repeatEveryDays: reminder.repeatEveryDays,
          },
        });
      }

      return completedReminder;
    });
  }

  delete(id: number, userId: number) {
    return this.prisma.maintenanceReminder.delete({
      where: {
        id,
        aquarium: { userId },
      },
    });
  }
}
