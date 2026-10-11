import { AquariumType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAquariumDto {
  @IsString()
  name!: string;

  @IsEnum(AquariumType)
  type!: AquariumType;

  @IsNumber()
  @Min(1)
  widthCm!: number;

  @IsNumber()
  @Min(1)
  heightCm!: number;

  @IsNumber()
  @Min(1)
  depthCm!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  setupDate?: string;
}
