import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  status?: 'PENDING_VERIFICATION' | 'ACTIVE' | 'BLOCKED';
  emailVerificationToken?: string | null;
  emailVerificationTokenExpiresAt?: Date | null;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserData) {
    return this.prisma.user.create({
      data,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmailVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });
  }

  updateVerificationToken(id: number, token: string, expiresAt: Date) {
    return this.prisma.user.update({
      where: { id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: expiresAt,
      },
    });
  }

  confirmEmail(
    id: number,
    data: {
      status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'BLOCKED';
      emailVerifiedAt: Date;
      emailVerificationToken: string | null;
      emailVerificationTokenExpiresAt: Date | null;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  updatePasswordResetToken(id: number, tokenHash: string, expiresAt: Date) {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: expiresAt,
      },
    });
  }

  consumePasswordResetToken(tokenHash: string, password: string, now: Date) {
    return this.prisma.user.updateMany({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: { gt: now },
        status: 'ACTIVE',
      },
      data: {
        password,
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
      },
    });
  }

  deleteAccount(id: number) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.measurement.deleteMany({
        where: { aquarium: { userId: id } },
      });
      await transaction.maintenanceReminder.deleteMany({
        where: { aquarium: { userId: id } },
      });
      await transaction.equipment.deleteMany({
        where: { aquarium: { userId: id } },
      });
      await transaction.ioTDevice.deleteMany({
        where: { aquarium: { userId: id } },
      });
      await transaction.aquarium.deleteMany({ where: { userId: id } });
      return transaction.user.delete({ where: { id } });
    });
  }

  updateAvatar(id: number, avatarUrl: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
  }
}
