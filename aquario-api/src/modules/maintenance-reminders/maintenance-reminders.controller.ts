import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MaintenanceRemindersService } from './application/maintenance-reminders.service';
import { CreateMaintenanceReminderDto } from './dto/create-maintenance-reminder.dto';
import { UpdateMaintenanceReminderDto } from './dto/update-maintenance-reminder.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard("jwt"))
@Controller('maintenance-reminders')
export class MaintenanceRemindersController {
  constructor(
    private readonly maintenanceRemindersService: MaintenanceRemindersService,
  ) {}

  @Post()
  create(
    @Body() body: CreateMaintenanceReminderDto,
    @CurrentUser("id") userId: number
  ) {
    return this.maintenanceRemindersService.create(body,userId);
  }

  @Get()
  findAll(
    @CurrentUser("id") userId:number
  ) {
    return this.maintenanceRemindersService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, 
    @CurrentUser("id") userId: number) {
    return this.maintenanceRemindersService.findOne(id,userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMaintenanceReminderDto,
    @CurrentUser("id") userId:number
  ) {
    return this.maintenanceRemindersService.update(id, body, userId);
  }

  @Patch(':id/done')
  markAsDone(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser("id")userId:number) {
    return this.maintenanceRemindersService.markAsDone(id,userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser("id")userId:number
) {
    return this.maintenanceRemindersService.remove(id,userId);
  }
}