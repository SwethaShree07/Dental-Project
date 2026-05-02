import AsyncStorage from '@react-native-async-storage/async-storage';
import { Role } from '../types';

const API_BASE = 'http://10.0.2.2:5000/api'; // Use 10.0.2.2 for Android emulator, localhost for iOS/Web
const TOKEN_KEY = 'alpha-dent.token';
const SESSION_KEY = 'alpha-dent.session';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthResult {
  ok: boolean;
  message: string;
  session?: AuthSession;
  token?: string;
}

// ---------------------------------------------------------------------------
// Token & Session Storage
// ---------------------------------------------------------------------------

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const saveSession = async (session: AuthSession) => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const stored = await AsyncStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
};

export const clearAuthSession = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(SESSION_KEY);
};

// ---------------------------------------------------------------------------
// Authentication APIs
// ---------------------------------------------------------------------------

export const signIn = async ({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: Role;
}): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, message: data.message || 'Login failed.' };
    }

    const session: AuthSession = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as Role,
    };

    await saveToken(data.token);
    await saveSession(session);

    return { ok: true, message: 'Signed in successfully.', session };
  } catch (error) {
    return { ok: false, message: 'Network error. Please check your connection.' };
  }
};

export const signUp = async ({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, message: data.message || 'Signup failed.' };
    }

    const session: AuthSession = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as Role,
    };

    await saveToken(data.token);
    await saveSession(session);

    return { ok: true, message: 'Account created successfully.', session };
  } catch (error) {
    return { ok: false, message: 'Network error. Please check your connection.' };
  }
};

export const validateSessionFromServer = async (): Promise<AuthSession | null> => {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      await clearAuthSession();
      return null;
    }

    const data = await response.json();
    const session: AuthSession = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as Role,
    };

    await saveSession(session);
    return session;
  } catch {
    return await getAuthSession(); // Fallback to cache if network is down
  }
};

export const ensureAuthSeeded = async () => {
    // No-op in real API mode
};
