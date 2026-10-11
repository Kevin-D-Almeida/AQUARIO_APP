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
import { AquariumsService } from './application/aquariums.service';
import { CreateAquariumDto } from './dto/create-aquarium.dto';
import { UpdateAquariumDto } from './dto/update-aquarium.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserType } from '../auth/types/current-user.type';

@UseGuards(AuthGuard('jwt'))
@Controller('aquariums')
export class AquariumsController {
  constructor(private readonly aquariumsService: AquariumsService) {}

  @Post()
  create(@Body() body: CreateAquariumDto, @CurrentUser('id') userId: number) {
    return this.aquariumsService.create(body, userId);
  }

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.aquariumsService.findAll(userId);
  }

  @Get('me')
  me(@CurrentUser() user: CurrentUserType) {
    return user;
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.aquariumsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAquariumDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.aquariumsService.update(id, body, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.aquariumsService.remove(id, userId);
  }
}
