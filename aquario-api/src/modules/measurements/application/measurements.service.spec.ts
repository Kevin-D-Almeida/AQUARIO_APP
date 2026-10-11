import { BadRequestException } from '@nestjs/common';
import { AquariumsRepository } from '../../aquariums/repositories/aquariums.repository';
import { MeasurementsRepository } from '../repositories/measurement.repository';
import { MeasurementsService } from './measurements.service';

describe('MeasurementsService', () => {
  const createMeasurement = jest.fn();
  const measurementsRepository = {
    create: createMeasurement,
    findDeviceByIdAndUser: jest.fn(),
  } as unknown as jest.Mocked<MeasurementsRepository>;
  const aquariumsRepository = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<AquariumsRepository>;
  const service = new MeasurementsService(
    measurementsRepository,
    aquariumsRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejeita dispositivo pertencente a outro aquário', async () => {
    aquariumsRepository.findById.mockResolvedValue({ id: 1 } as never);
    measurementsRepository.findDeviceByIdAndUser.mockResolvedValue({
      id: 5,
      aquariumId: 2,
    } as never);

    await expect(
      service.create(
        {
          type: 'PH',
          value: 7,
          unit: 'pH',
          aquariumId: 1,
          deviceId: 5,
        },
        10,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(createMeasurement).not.toHaveBeenCalled();
  });
});
