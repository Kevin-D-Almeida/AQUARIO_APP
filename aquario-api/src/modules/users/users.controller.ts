import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { randomUUID } from 'node:crypto';
import { createReadStream, mkdirSync } from 'node:fs';
import { diskStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  AVATAR_DIRECTORY,
  UsersProfileService,
} from './application/users-profile.service';

const avatarExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Controller('users/avatar')
export class UserAvatarController {
  constructor(private readonly usersProfileService: UsersProfileService) {}

  @Get(':filename')
  @Header('Cache-Control', 'public, max-age=86400')
  getAvatar(@Param('filename') filename: string) {
    const path = this.usersProfileService.getAvatarPath(filename);
    return new StreamableFile(createReadStream(path));
  }
}

@UseGuards(AuthGuard('jwt'))
@Controller('users/me/avatar')
export class UsersController {
  constructor(private readonly usersProfileService: UsersProfileService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 2 * 1024 * 1024, files: 1 },
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          mkdirSync(AVATAR_DIRECTORY, { recursive: true });
          callback(null, AVATAR_DIRECTORY);
        },
        filename: (_request, file, callback) => {
          const extension = avatarExtensions[file.mimetype];
          callback(null, `${randomUUID()}.${extension}`);
        },
      }),
      fileFilter: (_request, file, callback) => {
        if (!avatarExtensions[file.mimetype]) {
          callback(
            new BadRequestException('Envie uma imagem JPG, PNG ou WebP'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser('id') userId: number,
  ) {
    if (!file) throw new BadRequestException('Selecione uma imagem');
    return this.usersProfileService.updateAvatar(userId, file.filename);
  }

  @Delete()
  remove(@CurrentUser('id') userId: number) {
    return this.usersProfileService.removeAvatar(userId);
  }
}
