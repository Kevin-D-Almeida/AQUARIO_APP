import { AquariumCalculationService } from '../domain/aquarium-calculation.service';
import { AquariumsRepository } from '../repositories/aquariums.repository';
import { AquariumsService } from './aquariums.service';

describe('AquariumsService', () => {
  const update = jest.fn();
  const deleteAquarium = jest.fn();
  const repository = {
    findById: jest.fn(),
    update,
    delete: deleteAquarium,
  } as unknown as jest.Mocked<AquariumsRepository>;

  const service = new AquariumsService(
    repository,
    new AquariumCalculationService(),
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('recalcula o volume quando apenas uma dimensão é alterada', async () => {
    repository.findById.mockResolvedValue({
      widthCm: 60,
      heightCm: 40,
      depthCm: 30,
      equipment: [],
      reminders: [],
      iotDevices: [],
      measurements: [],
    } as never);
    repository.update.mockResolvedValue({} as never);

    await service.update(1, { widthCm: 80 }, 10);

    expect(update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        widthCm: 80,
        volumeLiters: 96,
      }),
      10,
    );
  });

  it('exclui o aquário mesmo quando possui dados relacionados', async () => {
    repository.findById.mockResolvedValue({
      equipment: [{}],
      reminders: [{ status: 'COMPLETED' }],
      iotDevices: [],
      measurements: [],
    } as never);
    deleteAquarium.mockResolvedValue({ id: 1 } as never);

    await service.remove(1, 10);

    expect(deleteAquarium).toHaveBeenCalledWith(1, 10);
  });
});
