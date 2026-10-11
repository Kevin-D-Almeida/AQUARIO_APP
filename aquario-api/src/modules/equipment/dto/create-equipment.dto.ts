import { EquipmentType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  name!: string;

  @IsEnum(EquipmentType)
  type!: EquipmentType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  biologicalCapacityLiters?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maintenanceIntervalDays?: number;

  @IsOptional()
  @IsDateString()
  installedAt?: string;

  @IsOptional()
  @IsDateString()
  lastMaintenanceAt?: string;

  @IsNumber()
  aquariumId!: number;
}
