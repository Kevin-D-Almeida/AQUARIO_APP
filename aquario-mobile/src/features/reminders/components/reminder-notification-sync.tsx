import { useQuery } from "@tanstack/react-query";
import { router, useRootNavigationState } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import Constants from "expo-constants";
import { useAuth } from "@/src/providers/auth-provider";
import {
  clearReminderNotifications,
  syncReminderNotifications,
} from "../services/reminder-notifications.service";
import { getReminders, reminderKeys } from "../services/reminders.service";

const notificationsSupported =
  !(Platform.OS === "android" && Constants.appOwnership === "expo");

export function ReminderNotificationSync() {
  if (!notificationsSupported) return null;

  const { isAuthenticated, isRestoringSession } = useAuth();
  const [pendingResponse, setPendingResponse] =
    useState<import("expo-notifications").NotificationResponse | null>(null);
  const handledNotificationIdRef = useRef<string | null>(null);
  const rootNavigationState = useRootNavigationState();
  const remindersQuery = useQuery({
    queryKey: reminderKeys.all,
    queryFn: getReminders,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isRestoringSession) return;

    if (!isAuthenticated) {
      void clearReminderNotifications();
      return;
    }

    if (remindersQuery.data) {
      void syncReminderNotifications(remindersQuery.data);
    }
  }, [isAuthenticated, isRestoringSession, remindersQuery.data]);

  useEffect(() => {
    const Notifications = require("expo-notifications");

    function saveResponse(response: import("expo-notifications").NotificationResponse) {
      setPendingResponse(response);
    }

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) saveResponse(lastResponse);

    const subscription = Notifications.addNotificationResponseReceivedListener(
      saveResponse,
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (
      isRestoringSession ||
      !isAuthenticated ||
      !rootNavigationState?.key
    ) {
      return;
    }

    const response = pendingResponse;
    if (!response) return;

    const notificationId = response.notification.request.identifier;
    if (handledNotificationIdRef.current === notificationId) return;

    handledNotificationIdRef.current = notificationId;
    setPendingResponse(null);

    const url = response.notification.request.content.data?.url;
    if (url === "/reminders") {
      router.replace("/reminders");
      return;
    }

    // Compatibilidade com notificações criadas por versões anteriores do app.
    if (typeof url === "string" && /^\/aquariums\/\d+$/.test(url)) {
      router.replace(url as `/aquariums/${string}`);
    }
  }, [
    isAuthenticated,
    isRestoringSession,
    pendingResponse,
    rootNavigationState?.key,
  ]);

  return null;
}
