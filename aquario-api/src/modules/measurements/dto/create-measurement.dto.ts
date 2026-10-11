import { MeasurementSource, MeasurementType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMeasurementDto {
  @IsEnum(MeasurementType)
  type!: MeasurementType;

  @IsOptional()
  @IsEnum(MeasurementSource)
  source?: MeasurementSource;

  @IsNumber()
  value!: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsDateString()
  measuredAt?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNumber()
  aquariumId!: number;

  @IsOptional()
  @IsNumber()
  deviceId?: number;
}
