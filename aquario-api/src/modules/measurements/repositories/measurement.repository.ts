import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeasurementDto } from '../dto/create-measurement.dto';
import { UpdateMeasurementDto } from '../dto/update-measurement.dto';

@Injectable()
export class MeasurementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateMeasurementDto) {
    return this.prisma.measurement.create({
      data: {
        ...data,
        measuredAt: data.measuredAt ? new Date(data.measuredAt) : undefined,
      },
    });
  }

  findAll(userId:number) {
    return this.prisma.measurement.findMany({
      where:{
        aquarium:{userId}
      },
      include: {
        aquarium: true,
        device: true,
      },
      orderBy: {
        measuredAt: 'desc',
      },
    });
  }

  findById(id: number) {
    return this.prisma.measurement.findUnique({
      where: { id },
      include: {
        aquarium: true,
        device: true,
      },
    });
  }

  findByAquariumId(aquariumId: number) {
  return this.prisma.measurement.findMany({
    where: { aquariumId },
    include: {
      aquarium: true,
      device: true,
    },
    orderBy: {
      measuredAt: 'desc',
    },
  });
}
  update(id: number, data: UpdateMeasurementDto,userId:number) {
    return this.prisma.measurement.update({
      where: { 
        id,
        aquarium:{userId}
       },
      data: {
        ...data,
        measuredAt: data.measuredAt ? new Date(data.measuredAt) : undefined,
      },
    });
  }

  delete(id: number,userId:number) {
    return this.prisma.measurement.delete({
      where: { 
        id,
        aquarium:{userId}
       },
    });
  }
}