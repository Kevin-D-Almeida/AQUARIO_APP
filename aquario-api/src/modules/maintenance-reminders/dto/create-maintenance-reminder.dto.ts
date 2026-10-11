import { ReminderType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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

  @IsOptional()
  @IsInt()
  @Min(1)
  repeatEveryDays?: number;
}
