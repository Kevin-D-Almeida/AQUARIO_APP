import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAquariumDto } from '../dto/create-aquarium.dto';
import { UpdateAquariumDto } from '../dto/update-aquarium.dto';

@Injectable()
export class AquariumsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAquariumDto & { volumeLiters: number; userId: number }) {
    return this.prisma.aquarium.create({
      data,
    });
  }

findByUser(userId: number) {
  return this.prisma.aquarium.findMany({
    where: {
      userId,
    },
    include: {
      equipment: true,
      reminders: true,
      measurements: true,
      iotDevices: true,
    },
  });
}

  findById(id: number, userId:number) {
    return this.prisma.aquarium.findUnique({
      where: { 
        id,
        userId
       },
      include: {
        equipment: true,
        reminders: true,
        iotDevices: true,
        measurements: true,
      },
    });
  }

  findByIdAndUser(id: number, userId: number) {
  return this.prisma.aquarium.findFirst({
    where: {
      id,
      userId,
    },
  });
}

  update(id: number, data: UpdateAquariumDto & { volumeLiters?: number },userId:number) {
    return this.prisma.aquarium.update({
      where: { 
        id,
        userId
       },
      data,
    });
  }

  delete(id: number,userId:number) {
    return this.prisma.aquarium.delete({
      where: { 
        id,
        userId
       },
    });
  }
}