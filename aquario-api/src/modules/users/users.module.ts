import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersRepository } from './repositories/users.repository';
import { UsersProfileService } from './application/users-profile.service';
import { UserAvatarController, UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserAvatarController, UsersController],
  providers: [UsersRepository, UsersProfileService],
  exports: [UsersRepository],
})
export class UsersModule {}
