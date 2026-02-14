import AsyncStorage from '@react-native-async-storage/async-storage';

const API_LOGIN_URL = 'https://www.wartimemaritime.org/api/login';
const AUTH_SESSION_KEY = 'wva_auth_session';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  member_type: string | null;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function loginWithApi(payload: LoginPayload): Promise<AuthSession> {
  const response = await fetch(API_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Login failed (${response.status})`;

    throw new Error(message);
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !('token' in data) ||
    typeof (data as { token?: unknown }).token !== 'string' ||
    !('user' in data) ||
    typeof (data as { user?: unknown }).user !== 'object' ||
    (data as { user?: unknown }).user === null
  ) {
    throw new Error('Unexpected login response from server.');
  }

  const user = (data as { user: AuthUser }).user;
  const token = (data as { token: string }).token;

  return { user, token };
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}
