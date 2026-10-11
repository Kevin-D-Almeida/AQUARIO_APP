import Constants from "expo-constants";
import { Platform } from "react-native";

import type { Reminder } from "../model/reminder.types";

const CHANNEL_ID = "aquarium-care";
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

let Notifications: typeof import("expo-notifications") | null = null;

try {
  Notifications = require("expo-notifications");
} catch {
  Notifications = null;
}

const isNotificationsAvailable =
  Boolean(Notifications) &&
  !(Platform.OS === "android" && Constants.appOwnership === "expo");

let lastScheduleSignature = "";

if (Notifications && isNotificationsAvailable) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function prepareReminderNotifications() {
  if (!Notifications || !isNotificationsAvailable) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Cuidados do aquário",
      description: "Lembretes de alimentação e manutenção dos aquários",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: "#087E8B",
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  if (currentPermission.status === "granted") return true;

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.status === "granted";
}

export async function clearReminderNotifications() {
  lastScheduleSignature = "";
  if (!Notifications || !isNotificationsAvailable) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function syncReminderNotifications(reminders: Reminder[]) {
  if (!Notifications || !isNotificationsAvailable) return;

  const pending = reminders
    .filter((reminder) => reminder.status === "PENDING")
    .sort((a, b) => a.id - b.id);
  const signature = pending
    .map(
      (reminder) => `${reminder.id}:${reminder.dueDate}:${reminder.updatedAt}`,
    )
    .join("|");

  if (signature === lastScheduleSignature) return;

  const permitted = await prepareReminderNotifications();
  if (!permitted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const reminder of pending) {
    await scheduleReminder(reminder);
  }

  lastScheduleSignature = signature;
}

async function scheduleReminder(reminder: Reminder) {
  const dueAt = new Date(reminder.dueDate).getTime();
  const now = Date.now();
  const aquariumName = reminder.aquarium?.name ?? "seu aquário";
  const data = {
    url: "/reminders",
    reminderId: reminder.id,
    aquariumId: reminder.aquariumId,
  };

  if (reminder.type === "WATER_CHANGE" || reminder.type === "FILTER_CLEANING") {
    await scheduleAt(
      dueAt - DAY,
      "Prepare a água 💧",
      `Amanhã é dia de ${reminder.title.toLowerCase()} em ${aquariumName}. Deixe a água preparada.`,
      data,
    );
  }

  await scheduleAt(
    dueAt - HOUR,
    `Falta 1 hora para: ${reminder.title}`,
    `${aquariumName} vai precisar de você em breve.`,
    data,
  );
  await scheduleAt(
    dueAt,
    reminder.title,
    `Chegou a hora de cuidar de ${aquariumName} 🐠`,
    data,
  );

  const overdueTimes =
    dueAt <= now
      ? [now + 5_000, now + 6 * HOUR, now + DAY]
      : [dueAt + 6 * HOUR, dueAt + DAY, dueAt + 2 * DAY];
  const overdueMessages = [
    {
      title: "Esqueceu de mim? :(",
      body: `Os peixinhos de ${aquariumName} ainda estão esperando: ${reminder.title}.`,
    },
    {
      title: "Ainda estou esperando 🐟",
      body: `Que tal concluir “${reminder.title}” agora? Seu aquário agradece.`,
    },
    {
      title: "Seus peixes sentem sua falta",
      body: `A atividade “${reminder.title}” continua pendente em ${aquariumName}.`,
    },
  ];

  for (let index = 0; index < overdueTimes.length; index += 1) {
    await scheduleAt(
      overdueTimes[index],
      overdueMessages[index].title,
      overdueMessages[index].body,
      data,
    );
  }
}

async function scheduleAt(
  timestamp: number,
  title: string,
  body: string,
  data: Record<string, string | number>,
) {
  if (!Notifications || !isNotificationsAvailable) return;
  if (timestamp <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
      color: "#087E8B",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(timestamp),
      channelId: CHANNEL_ID,
    },
  });
}
