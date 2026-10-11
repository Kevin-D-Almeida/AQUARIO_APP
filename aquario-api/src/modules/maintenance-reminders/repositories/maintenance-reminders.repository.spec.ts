import { ReminderStatus, ReminderType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MaintenanceReminderRepository } from './maintenance-reminders.repository';

describe('MaintenanceReminderRepository', () => {
  const findUniqueOrThrow = jest.fn();
  const update = jest.fn();
  const create = jest.fn();
  const transactionClient = {
    maintenanceReminder: {
      findUniqueOrThrow,
      update,
      create,
    },
  };
  const prisma = {
    $transaction: jest.fn(
      (callback: (client: typeof transactionClient) => unknown) =>
        Promise.resolve(callback(transactionClient)),
    ),
  } as unknown as PrismaService;
  const repository = new MaintenanceReminderRepository(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-20T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('conclui e cria somente a próxima ocorrência futura', async () => {
    findUniqueOrThrow.mockResolvedValue({
      id: 1,
      title: 'Alimentar os peixes',
      description: null,
      type: ReminderType.FEEDING,
      dueDate: new Date('2026-07-18T10:00:00.000Z'),
      aquariumId: 2,
      equipmentId: null,
      repeatEveryDays: 1,
    });
    update.mockResolvedValue({
      id: 1,
      status: ReminderStatus.DONE,
    });
    create.mockResolvedValue({ id: 2 });

    await repository.markAsDone(1, 10);

    expect(update).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        title: 'Alimentar os peixes',
        description: null,
        type: ReminderType.FEEDING,
        aquariumId: 2,
        equipmentId: null,
        repeatEveryDays: 1,
        dueDate: new Date('2026-07-21T10:00:00.000Z'),
      },
    });
  });
});
