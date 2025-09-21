import * as Notifications from "expo-notifications";
import type {
  NotificationBehavior,
  DateTriggerInput,
} from "expo-notifications";
import { Platform } from "react-native";

export const ensureNotificationPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async (): Promise<NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const scheduleTaskNotification = async (
  title: string,
  dueISO: string
) => {
  const date = new Date(dueISO);

  const trigger: DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
  };

  return Notifications.scheduleNotificationAsync({
    content: { title: "Lembrete", body: title },
    trigger,
  });
};
