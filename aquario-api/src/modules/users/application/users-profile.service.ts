import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { UsersRepository } from '../repositories/users.repository';

export const AVATAR_DIRECTORY = join(process.cwd(), 'uploads', 'avatars');

@Injectable()
export class UsersProfileService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async updateAvatar(userId: number, filename: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const previousFilename = user.avatarUrl
      ? basename(user.avatarUrl)
      : undefined;
    const updatedUser = await this.usersRepository.updateAvatar(
      userId,
      `/users/avatar/${filename}`,
    );

    await this.removeFile(previousFilename);
    return updatedUser;
  }

  async removeAvatar(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const previousFilename = user.avatarUrl
      ? basename(user.avatarUrl)
      : undefined;
    const updatedUser = await this.usersRepository.updateAvatar(userId, null);

    await this.removeFile(previousFilename);
    return updatedUser;
  }

  async deleteAccount(userId: number, password: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new BadRequestException('Senha atual incorreta.');
    }

    const avatarFilename = user.avatarUrl
      ? basename(user.avatarUrl)
      : undefined;
    await this.usersRepository.deleteAccount(userId);
    await this.removeFile(avatarFilename).catch(() => undefined);

    return { message: 'Conta excluída com sucesso.' };
  }

  getAvatarPath(filename: string) {
    if (!/^[0-9a-f-]+\.(jpe?g|png|webp)$/i.test(filename)) {
      throw new NotFoundException('Imagem não encontrada');
    }

    const path = join(AVATAR_DIRECTORY, filename);
    if (!existsSync(path)) throw new NotFoundException('Imagem não encontrada');
    return path;
  }

  private async removeFile(filename?: string) {
    if (!filename) return;
    const path = join(AVATAR_DIRECTORY, filename);
    if (existsSync(path)) await unlink(path);
  }
}
