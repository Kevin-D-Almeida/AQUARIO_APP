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
import { EquipmentService } from './application/equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@UseGuards(AuthGuard('jwt'))
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  create(@Body() body: CreateEquipmentDto,
  @CurrentUser("id") userId: number) {
    return this.equipmentService.create(body,userId);
  }

  @Get()
  findAll(@CurrentUser("id") userId: number) {
    return this.equipmentService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser("id") userId: number
  ) {
    return this.equipmentService.findOne(id,userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEquipmentDto,
    @CurrentUser("id") userId: number
  ) {
    return this.equipmentService.update(id, body,userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser("id") userId:number
  ) {
    return this.equipmentService.remove(id,userId);
  }
}