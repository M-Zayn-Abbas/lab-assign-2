// UNIT: Local storage functions (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = (userId) => `profile:${userId}`;
const SESSION_KEY = 'session';

export async function saveProfile(userId, profile) {
  if (!userId) throw new Error('userId is required');
  await AsyncStorage.setItem(PROFILE_KEY(userId), JSON.stringify(profile));
  return true;
}

export async function loadProfile(userId) {
  const raw = await AsyncStorage.getItem(PROFILE_KEY(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null; // corrupted data
  }
}

export async function clearProfile(userId) {
  await AsyncStorage.removeItem(PROFILE_KEY(userId));
}

export async function saveSession(user) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export async function loadSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
