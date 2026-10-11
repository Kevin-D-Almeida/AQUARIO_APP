import { IsInt, Max, Min } from 'class-validator';

export class CompleteMaintenanceReminderDto {
  @IsInt()
  @Min(-840)
  @Max(840)
  timezoneOffsetMinutes!: number;
}
