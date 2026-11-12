import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findByEmailVerificationToken: jest.fn(),
    confirmEmail: jest.fn(),
    updateVerificationToken: jest.fn(),
    updatePasswordResetToken: jest.fn(),
    consumePasswordResetToken: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'APP_BASE_URL') return 'http://localhost:3000';
      if (key === 'RESEND_API_KEY') return 'test-key';
      if (key === 'RESEND_FROM_EMAIL') return 'no-reply@aquario.app';
      return undefined;
    }),
  };

  const service = new AuthService(
    usersRepository as any,
    jwtService as any,
    configService as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('confirma o e-mail quando o token é válido', async () => {
    usersRepository.findByEmailVerificationToken.mockResolvedValue({
      id: 7,
      email: 'maria@teste.com',
      emailVerificationTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    usersRepository.confirmEmail.mockResolvedValue({
      id: 7,
      name: 'Maria',
      email: 'maria@teste.com',
    });

    const result = await service.verifyEmail('valid-token');

    expect(usersRepository.confirmEmail).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        status: 'ACTIVE',
        emailVerifiedAt: expect.any(Date),
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      }),
    );
    expect(result).toEqual({ message: 'E-mail confirmado com sucesso.' });
  });

  it('lança erro quando o token está expirado', async () => {
    usersRepository.findByEmailVerificationToken.mockResolvedValue({
      id: 7,
      email: 'maria@teste.com',
      emailVerificationTokenExpiresAt: new Date(Date.now() - 60_000),
    });

    await expect(service.verifyEmail('expired-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('não permite registrar um e-mail duplicado', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'joao@teste.com',
    });

    await expect(
      service.register({
        name: 'João',
        email: 'joao@teste.com',
        password: '123456',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('cria a conta pendente sem sessão e sinaliza quando o e-mail falha', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue({
      id: 15,
      name: 'Maria',
      email: 'maria@teste.com',
      avatarUrl: null,
      status: 'PENDING_VERIFICATION',
    });
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      text: async () => 'provider unavailable',
    } as Response);

    await expect(
      service.register({
        name: 'Maria',
        email: 'maria@teste.com',
        password: 'senha-segura',
      }),
    ).resolves.toEqual({
      id: 15,
      name: 'Maria',
      email: 'maria@teste.com',
      avatarUrl: null,
      status: 'PENDING_VERIFICATION',
      emailSent: false,
    });
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });

  it('responde de forma genérica quando o e-mail de recuperação não existe', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.requestPasswordReset('inexistente@teste.com'),
    ).resolves.toEqual({
      message:
        'Se existir uma conta ativa com este e-mail, enviaremos as instruções para redefinir a senha.',
    });
  });

  it('rejeita um token de redefinição inválido ou já utilizado', async () => {
    usersRepository.consumePasswordResetToken.mockResolvedValue({ count: 0 });

    await expect(
      service.resetPassword('invalid-token', 'nova-senha-segura'),
    ).rejects.toThrow(BadRequestException);
  });

  it('armazena somente o hash do token ao solicitar redefinição', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 12,
      email: 'maria@teste.com',
      status: 'ACTIVE',
    });
    usersRepository.updatePasswordResetToken.mockResolvedValue({} as never);
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true } as Response);

    await service.requestPasswordReset(' MARIA@TESTE.COM ');

    const emailPayload = JSON.parse(
      (fetchMock.mock.calls[0][1]?.body as string) ?? '{}',
    ) as { html: string };
    const token = emailPayload.html.match(
      /word-break:break-all">([a-f0-9]+)<\/p>/,
    )?.[1];

    expect(token).toHaveLength(64);
    expect(usersRepository.updatePasswordResetToken).toHaveBeenCalledWith(
      12,
      createHash('sha256').update(token!).digest('hex'),
      expect.any(Date),
    );
    fetchMock.mockRestore();
  });

  it('salva a nova senha e consome o token válido', async () => {
    usersRepository.consumePasswordResetToken.mockResolvedValue({ count: 1 });
    const token = 'a'.repeat(64);

    await expect(
      service.resetPassword(token, 'nova-senha-segura'),
    ).resolves.toEqual({ message: 'Senha redefinida com sucesso.' });

    const [tokenHash, passwordHash] =
      usersRepository.consumePasswordResetToken.mock.calls[0];
    expect(tokenHash).toBe(createHash('sha256').update(token).digest('hex'));
    await expect(
      bcrypt.compare('nova-senha-segura', passwordHash),
    ).resolves.toBe(true);
  });
});
