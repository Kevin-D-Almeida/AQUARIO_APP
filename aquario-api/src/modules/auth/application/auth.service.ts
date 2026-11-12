import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { UsersRepository } from '../../users/repositories/users.repository';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const userAlreadyExists =
      await this.usersRepository.findByEmail(normalizedEmail);

    if (userAlreadyExists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const emailVerificationToken = this.generateVerificationToken();
    const emailVerificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersRepository.create({
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      status: 'PENDING_VERIFICATION',
      emailVerificationToken,
      emailVerificationTokenExpiresAt,
    });

    let emailSent = false;
    try {
      const result = await this.sendVerificationEmail(
        user.email,
        emailVerificationToken,
      );
      emailSent = !result.skipped;
    } catch (error) {
      this.logger.warn(
        `Conta ${user.id} criada, mas o e-mail de confirmação não foi enviado: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      status: user.status,
      emailSent,
    };
  }

  async login(data: LoginDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Confirme seu e-mail antes de entrar na sua conta.',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async verifyEmail(token: string) {
    const normalizedToken = token?.trim();

    if (!normalizedToken) {
      throw new BadRequestException('Token de confirmação ausente.');
    }

    const user =
      await this.usersRepository.findByEmailVerificationToken(normalizedToken);

    if (!user) {
      throw new BadRequestException('Token de confirmação inválido.');
    }

    const expiresAt = user.emailVerificationTokenExpiresAt;
    if (!expiresAt || expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        'O link de confirmação expirou. Solicite um novo e-mail.',
      );
    }

    await this.usersRepository.confirmEmail(user.id, {
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });

    return {
      message: 'E-mail confirmado com sucesso.',
    };
  }

  async resendVerificationEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.status === 'ACTIVE') {
      return {
        message: 'Este e-mail já foi confirmado.',
      };
    }

    if (user.status === 'BLOCKED') {
      throw new BadRequestException('Esta conta está bloqueada.');
    }

    const token = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersRepository.updateVerificationToken(
      user.id,
      token,
      expiresAt,
    );
    await this.sendVerificationEmail(user.email, token);

    return {
      message: 'E-mail de confirmação reenviado com sucesso.',
    };
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(normalizedEmail);

    if (user?.status === 'ACTIVE') {
      const token = this.generateVerificationToken();
      const tokenHash = this.hashToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.usersRepository.updatePasswordResetToken(
        user.id,
        tokenHash,
        expiresAt,
      );
      await this.sendPasswordResetEmail(user.email, token);
    }

    return {
      message:
        'Se existir uma conta ativa com este e-mail, enviaremos as instruções para redefinir a senha.',
    };
  }

  async resetPassword(token: string, password: string) {
    const normalizedToken = token?.trim();
    if (!normalizedToken) {
      throw new BadRequestException('Token de redefinição ausente.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.usersRepository.consumePasswordResetToken(
      this.hashToken(normalizedToken),
      hashedPassword,
      new Date(),
    );

    if (result.count !== 1) {
      throw new BadRequestException(
        'O link de redefinição é inválido ou expirou. Solicite um novo e-mail.',
      );
    }

    return { message: 'Senha redefinida com sucesso.' };
  }

  private generateVerificationToken() {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const resendFromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');

    if (!resendApiKey || !resendFromEmail) return;

    const appUrl =
      this.configService.get<string>('MOBILE_APP_URL') ??
      'aquariomobile://reset-password';
    const resetUrl = `${appUrl}${appUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [email],
        subject: 'Redefina sua senha - Aquário',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
            <h2>Redefina sua senha</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta Aquário. O link expira em 1 hora e só pode ser usado uma vez.</p>
            <p><a href="${resetUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Redefinir senha</a></p>
            <p>Se o botão não abrir o aplicativo, use este código na tela de redefinição:</p>
            <p style="word-break:break-all">${token}</p>
            <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao enviar e-mail de redefinição: ${errorText}`);
    }
  }

  private async sendVerificationEmail(email: string, token: string) {
    const appBaseUrl =
      this.configService.get<string>('APP_BASE_URL') ?? 'http://localhost:3000';
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const resendFromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');

    const verificationUrl = `${appBaseUrl.replace(/\/$/, '')}/auth/verify-email?token=${encodeURIComponent(token)}`;

    if (!resendApiKey || !resendFromEmail) {
      return {
        skipped: true,
        verificationUrl,
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [email],
        subject: 'Confirme seu e-mail - Aquário',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
            <h2>Confirme seu e-mail</h2>
            <p>Para ativar sua conta no Aquário, confirme seu endereço de e-mail clicando no botão abaixo.</p>
            <p>
              <a href="${verificationUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">
                Confirmar e-mail
              </a>
            </p>
            <p>Se o link não funcionar, copie e cole este endereço no navegador:</p>
            <p>${verificationUrl}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao enviar e-mail de confirmação: ${errorText}`);
    }

    return {
      skipped: false,
      verificationUrl,
    };
  }
}
