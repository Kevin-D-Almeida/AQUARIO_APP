import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository';
import { UsersProfileService } from './users-profile.service';

describe('UsersProfileService', () => {
  const usersRepository = {
    findById: jest.fn(),
    deleteAccount: jest.fn(),
  } as unknown as jest.Mocked<UsersRepository>;

  const service = new UsersProfileService(usersRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não exclui a conta quando a senha atual está incorreta', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 5,
      password: await bcrypt.hash('senha-correta', 4),
      avatarUrl: null,
    } as never);

    await expect(service.deleteAccount(5, 'senha-incorreta')).rejects.toThrow(
      BadRequestException,
    );
    expect(usersRepository.deleteAccount).not.toHaveBeenCalled();
  });

  it('exclui a conta quando a senha atual confere', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 5,
      password: await bcrypt.hash('senha-correta', 4),
      avatarUrl: null,
    } as never);
    usersRepository.deleteAccount.mockResolvedValue({} as never);

    await expect(service.deleteAccount(5, 'senha-correta')).resolves.toEqual({
      message: 'Conta excluída com sucesso.',
    });
    expect(usersRepository.deleteAccount).toHaveBeenCalledWith(5);
  });
});
