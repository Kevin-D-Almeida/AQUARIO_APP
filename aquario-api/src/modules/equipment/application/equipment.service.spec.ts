import { ConflictException } from '@nestjs/common';
import { AquariumsRepository } from '../../aquariums/repositories/aquariums.repository';
import { EquipmentRepository } from '../repositories/equipments.repository';
import { EquipmentService } from './equipment.service';

describe('EquipmentService', () => {
  const deleteEquipment = jest.fn();
  const equipmentRepository = {
    findByIdAndUser: jest.fn(),
    delete: deleteEquipment,
  } as unknown as jest.Mocked<EquipmentRepository>;
  const aquariumsRepository = {} as unknown as jest.Mocked<AquariumsRepository>;
  const service = new EquipmentService(
    equipmentRepository,
    aquariumsRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloqueia exclusão quando o equipamento possui lembretes', async () => {
    equipmentRepository.findByIdAndUser.mockResolvedValue({
      reminders: [{}],
    } as never);

    await expect(service.remove(1, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(deleteEquipment).not.toHaveBeenCalled();
  });
});
