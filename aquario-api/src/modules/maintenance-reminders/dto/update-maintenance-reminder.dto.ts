import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateMaintenanceReminderDto } from './create-maintenance-reminder.dto';

export class UpdateMaintenanceReminderDto extends PartialType(
  OmitType(CreateMaintenanceReminderDto, ['repeatEveryDays'] as const),
) {
  @IsOptional()
  @IsInt()
  @Min(1)
  repeatEveryDays?: number | null;
}
