import type { AuthResponse, AuthUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "secureboard.access-token";
const USER_KEY = "secureboard.user";

type SessionSnapshot = {
  accessToken: string | null;
  user: AuthUser | null;
};

let accessToken: string | null = null;
let currentUser: AuthUser | null = null;

const sessionListeners = new Set<(snapshot: SessionSnapshot) => void>();
const unauthenticatedListeners = new Set<() => void>();

function canUseStorage() {
  return typeof window !== "undefined";
}

function emitSession() {
  const snapshot = getSessionSnapshot();
  sessionListeners.forEach((listener) => listener(snapshot));
}

function persistSession() {
  if (!canUseStorage()) {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (currentUser) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
}

export function hydrateSession() {
  if (!canUseStorage()) {
    return getSessionSnapshot();
  }

  accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  const serializedUser = window.localStorage.getItem(USER_KEY);
  currentUser = serializedUser ? (JSON.parse(serializedUser) as AuthUser) : null;

  return getSessionSnapshot();
}

export function setSession(payload: AuthResponse) {
  accessToken = payload.accessToken;
  currentUser = payload.user;
  persistSession();
  emitSession();
}

export function updateSessionUser(user: AuthUser) {
  currentUser = user;
  persistSession();
  emitSession();
}

export function clearSession() {
  accessToken = null;
  currentUser = null;
  persistSession();
  emitSession();
}

export function getSessionSnapshot(): SessionSnapshot {
  return {
    accessToken,
    user: currentUser,
  };
}

export function subscribeSession(listener: (snapshot: SessionSnapshot) => void) {
  sessionListeners.add(listener);

  return () => {
    sessionListeners.delete(listener);
  };
}

export function subscribeUnauthenticated(listener: () => void) {
  unauthenticatedListeners.add(listener);

  return () => {
    unauthenticatedListeners.delete(listener);
  };
}

export function notifyUnauthenticated() {
  unauthenticatedListeners.forEach((listener) => listener());
}
