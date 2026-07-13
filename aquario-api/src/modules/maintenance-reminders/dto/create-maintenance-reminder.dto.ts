import { ReminderType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMaintenanceReminderDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReminderType)
  type!: ReminderType;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  aquariumId!: number;

  @IsOptional()
  @IsNumber()
  equipmentId?: number;
}