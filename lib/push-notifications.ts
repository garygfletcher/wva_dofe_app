import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API_BASE_URL = 'https://www.wartimemaritime.org/api';

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Must use physical device for Push Notifications');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permission not granted');
    return;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;

  console.log(token);

  return token;
}

export async function getExpoTokenFromApi(authToken: string) {
  const response = await fetch(`${API_BASE_URL}/expo-token`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch expo token (${response.status})`);
  }

  const data = (await response.json()) as { expo_token?: string | null };
  return data.expo_token ?? null;
}

export async function setExpoTokenOnApi(input: {
  authToken: string;
  expoToken: string | null;
}) {
  const response = await fetch(`${API_BASE_URL}/expo-token`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${input.authToken}`,
    },
    body: JSON.stringify({
      expo_token: input.expoToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to update expo token (${response.status})`);
  }

  return (await response.json()) as {
    message?: string;
    expo_token?: string | null;
  };
}
