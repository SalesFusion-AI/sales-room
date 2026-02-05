export const DEFAULT_PII_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface ExpiringSessionPayload<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
}

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

export const isSessionStorageAvailable = (): boolean => {
  try {
    const storage = getSessionStorage();
    if (!storage) return false;
    const testKey = '__sessionStorage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('sessionStorage is not available:', error);
    return false;
  }
};

export const setExpiringSessionItem = <T>(key: string, value: T, ttlMs: number = DEFAULT_PII_TTL_MS): boolean => {
  try {
    const storage = getSessionStorage();
    if (!storage) return false;

    const now = Date.now();
    const payload: ExpiringSessionPayload<T> = {
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
    };

    storage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn(`Failed to set sessionStorage key: ${key}`, error);
    return false;
  }
};

export const getExpiringSessionItem = <T>(key: string): T | null => {
  try {
    const storage = getSessionStorage();
    if (!storage) return null;

    const raw = storage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ExpiringSessionPayload<T> | T;

    if (parsed && typeof parsed === 'object' && 'expiresAt' in parsed && 'value' in parsed) {
      const payload = parsed as ExpiringSessionPayload<T>;
      if (Date.now() > payload.expiresAt) {
        storage.removeItem(key);
        return null;
      }
      return payload.value;
    }

    // Legacy or non-expiring payload; rewrap with default TTL for safety
    setExpiringSessionItem(key, parsed as T);
    return parsed as T;
  } catch (error) {
    console.warn(`Failed to read sessionStorage key: ${key}`, error);
    return null;
  }
};

export const setSessionItem = (key: string, value: string): void => {
  try {
    const storage = getSessionStorage();
    if (!storage) return;
    storage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set sessionStorage key: ${key}`, error);
  }
};

export const getSessionItem = (key: string): string | null => {
  try {
    const storage = getSessionStorage();
    if (!storage) return null;
    return storage.getItem(key);
  } catch (error) {
    console.warn(`Failed to access sessionStorage key: ${key}`, error);
    return null;
  }
};

export const removeSessionItem = (key: string): void => {
  try {
    const storage = getSessionStorage();
    if (!storage) return;
    storage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove sessionStorage key: ${key}`, error);
  }
};
