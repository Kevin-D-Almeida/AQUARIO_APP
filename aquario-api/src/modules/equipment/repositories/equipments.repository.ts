import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';

@Injectable()
export class EquipmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateEquipmentDto) {
    return this.prisma.equipment.create({ data });
  }

  findAll(userId: number) {
    return this.prisma.equipment.findMany({
      where: {
        aquarium: { userId },
      },
      include: {
        aquarium: true,
        reminders: true,
      },
    });
  }

  findByIdAndUser(id: number, userId: number) {
    return this.prisma.equipment.findUnique({
      where: {
        id,
        aquarium: { userId },
      },
      include: {
        aquarium: true,
        reminders: true,
      },
    });
  }

  update(id: number, data: UpdateEquipmentDto, userId: number) {
    return this.prisma.equipment.update({
      where: {
        id,
        aquarium: { userId },
      },
      data,
    });
  }

  delete(id: number, userId: number) {
    return this.prisma.equipment.delete({
      where: {
        id,
        aquarium: { userId },
      },
    });
  }
}
