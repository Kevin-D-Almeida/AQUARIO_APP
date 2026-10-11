import { api } from "@/src/shared/services/api";
import type {
  CreateReminderRequest,
  Reminder,
  UpdateReminderRequest,
} from "../model/reminder.types";

export async function getReminders(): Promise<Reminder[]> {
  const response = await api.get<Reminder[]>("/maintenance-reminders");
  return response.data;
}

export async function createReminder(data: CreateReminderRequest) {
  const response = await api.post<Reminder>("/maintenance-reminders", data);
  return response.data;
}

export async function getReminder(id: number) {
  const response = await api.get<Reminder>(`/maintenance-reminders/${id}`);
  return response.data;
}

export async function updateReminder({
  id,
  data,
}: {
  id: number;
  data: UpdateReminderRequest;
}) {
  const response = await api.patch<Reminder>(
    `/maintenance-reminders/${id}`,
    data,
  );
  return response.data;
}

export async function markReminderAsDone(id: number) {
  const response = await api.patch<Reminder>(
    `/maintenance-reminders/${id}/done`,
    { timezoneOffsetMinutes: new Date().getTimezoneOffset() },
  );
  return response.data;
}

export async function deleteReminder(id: number) {
  await api.delete(`/maintenance-reminders/${id}`);
}

export const reminderKeys = { all: ["reminders"] as const };
