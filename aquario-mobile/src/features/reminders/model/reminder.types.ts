export type ReminderType =
  | "WATER_CHANGE"
  | "FILTER_CLEANING"
  | "MEDIA_REPLACEMENT"
  | "FEEDING"
  | "FERTILIZATION"
  | "SENSOR_CALIBRATION"
  | "OTHER";

export type Reminder = {
  id: number;
  title: string;
  description: string | null;
  type: ReminderType;
  status: "PENDING" | "DONE" | "CANCELED";
  dueDate: string;
  completedAt: string | null;
  aquariumId: number;
  equipmentId: number | null;
  repeatEveryDays: number | null;
  aquarium?: { id: number; name: string };
  equipment?: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReminderRequest = {
  title: string;
  description?: string;
  type: ReminderType;
  dueDate: string;
  aquariumId: number;
  equipmentId?: number;
  repeatEveryDays?: number;
};

export type UpdateReminderRequest = Partial<
  Omit<CreateReminderRequest, "repeatEveryDays">
> & {
  repeatEveryDays?: number | null;
};

export const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: "WATER_CHANGE", label: "Troca de água" },
  { value: "FILTER_CLEANING", label: "Limpeza do filtro" },
  { value: "MEDIA_REPLACEMENT", label: "Troca de mídia" },
  { value: "FEEDING", label: "Alimentação" },
  { value: "FERTILIZATION", label: "Fertilização" },
  { value: "SENSOR_CALIBRATION", label: "Calibrar sensor" },
  { value: "OTHER", label: "Outro" },
];

export function formatReminderRecurrence(days: number | null) {
  if (!days) return "Não repete";
  if (days === 1) return "Todos os dias";
  if (days === 7) return "Toda semana";
  return `A cada ${days} dias`;
}
