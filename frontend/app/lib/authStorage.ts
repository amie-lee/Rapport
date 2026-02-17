export type AuthProfile = {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  goal?: string;
  memo?: string;
  lastLogin?: string;
  preferredContact?: "email" | "sms" | "none";
  notifications?: {
    sessionSummary: boolean;
    weeklyTips: boolean;
    emergencyAlerts: boolean;
  };
};

const STORAGE_KEY = "rapport-auth-profile";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadProfile(): AuthProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthProfile) : null;
  } catch (error) {
    console.error("Failed to parse stored profile", error);
    return null;
  }
}

export function saveProfile(profile: AuthProfile) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to store profile", error);
  }
}

export function clearProfile() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function touchLogin(profile: AuthProfile, at: string = new Date().toISOString()) {
  const next = { ...profile, lastLogin: at };
  saveProfile(next);
  return next;
}
