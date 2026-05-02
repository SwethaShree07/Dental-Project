import { Role } from '../types';

const API_BASE = 'http://localhost:5000/api';
const TOKEN_KEY = 'alpha-dent.token';
const SESSION_KEY = 'alpha-dent.session';

export interface AuthSession {
  name: string;
  email: string;
  role: Role;
}

interface ApiAuthResult {
  ok: boolean;
  message: string;
  session?: AuthSession;
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export const saveToken = (token: string) =>
  window.localStorage.setItem(TOKEN_KEY, token);

export const getToken = (): string | null =>
  window.localStorage.getItem(TOKEN_KEY);

export const clearToken = () =>
  window.localStorage.removeItem(TOKEN_KEY);

// ---------------------------------------------------------------------------
// Session cache helpers (so the app can read name/role instantly)
// ---------------------------------------------------------------------------

const saveSessionCache = (session: AuthSession) =>
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));

export const getAuthSession = (): AuthSession | null => {
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
};

export const clearAuthSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
  clearToken();
};

// ---------------------------------------------------------------------------
// Validate token against server on startup (cross-device check)
// ---------------------------------------------------------------------------

export const validateSessionFromServer = async (): Promise<AuthSession | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearAuthSession();
      return null;
    }
    const { user } = await res.json();
    const session: AuthSession = { name: user.name, email: user.email, role: user.role as Role };
    saveSessionCache(session);
    return session;
  } catch {
    // Network error — fall back to cached session (offline mode)
    return getAuthSession();
  }
};

// ---------------------------------------------------------------------------
// Sign In — validates against backend MongoDB
// ---------------------------------------------------------------------------

export const signIn = async ({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: Role;
}): Promise<ApiAuthResult> => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data.message || 'Login failed' };
    }

    const session: AuthSession = {
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as Role,
    };

    saveToken(data.token);
    saveSessionCache(session);

    return { ok: true, message: 'Signed in successfully.', session };
  } catch (err) {
    console.warn("Auth network error, falling back to local session:", err);
    // Development fallback: Log in anyway with mock data
    const session: AuthSession = { name: email.split('@')[0], email, role };
    saveToken("mock-token-dev");
    saveSessionCache(session);
    return { ok: true, message: 'Signed in (Offline Mode).', session };
  }
};

// ---------------------------------------------------------------------------
// Sign Up — creates account in backend MongoDB
// ---------------------------------------------------------------------------

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
}): Promise<ApiAuthResult> => {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data.message || 'Signup failed' };
    }

    const session: AuthSession = {
      name: data.user.name,
      email: data.user.email,
      role: data.user.role as Role,
    };

    saveToken(data.token);
    saveSessionCache(session);

    return { ok: true, message: 'Account created successfully.', session };
  } catch (err) {
    console.warn("Auth network error (signup), falling back to local session:", err);
    // Development fallback: Sign up anyway with mock data
    const session: AuthSession = { name, email, role };
    saveToken("mock-token-dev");
    saveSessionCache(session);
    return { ok: true, message: 'Account created (Offline Mode).', session };
  }
};

// ---------------------------------------------------------------------------
// Legacy demo credentials (still work by creating via backend on first use)
// ---------------------------------------------------------------------------

export const DEMO_CREDENTIALS = [
  { role: 'patient' as Role, name: 'Patient Demo', email: 'patient@alphadent.demo', password: 'patient123' },
  { role: 'doctor' as Role, name: 'Doctor Demo', email: 'doctor@alphadent.demo', password: 'doctor123' },
];

export const ensureAuthSeeded = () => {
  // No-op: seeding is now handled by backend or demo login flow
};
