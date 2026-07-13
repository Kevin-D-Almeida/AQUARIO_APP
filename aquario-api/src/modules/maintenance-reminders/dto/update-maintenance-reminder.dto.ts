import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceReminderDto } from './create-maintenance-reminder.dto';

export class UpdateMaintenanceReminderDto extends PartialType(
  CreateMaintenanceReminderDto,
) {}