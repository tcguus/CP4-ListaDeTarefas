// src/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import type {
  NotificationBehavior,
  DateTriggerInput,
} from 'expo-notifications';
import { Platform } from 'react-native';

export const ensureNotificationPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }

  // Android: criar canal para garantir exibição
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Handler com TODOS os campos que o tipo pede (iOS recentes exigem banner/list)
  Notifications.setNotificationHandler({
    handleNotification: async (): Promise<NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      // iOS 14+ (expo types pedem esses campos)
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const scheduleTaskNotification = async (title: string, dueISO: string) => {
  const date = new Date(dueISO);

  // Use o enum de tipo em vez de string literal
  const trigger: DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
  };

  return Notifications.scheduleNotificationAsync({
    content: { title: 'Lembrete', body: title },
    trigger,
  });
};
