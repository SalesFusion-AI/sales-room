import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  DEFAULT_PII_TTL_MS,
  isSessionStorageAvailable,
  setExpiringSessionItem,
  getExpiringSessionItem,
  setSessionItem,
  getSessionItem,
  removeSessionItem
} from '../utils/sessionStorage';

describe('sessionStorage utilities', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('detects sessionStorage availability', () => {
    expect(isSessionStorageAvailable()).toBe(true);
  });

  it('sets and retrieves an expiring session item', () => {
    const result = setExpiringSessionItem('key', { value: 123 });
    expect(result).toBe(true);

    const stored = getExpiringSessionItem<{ value: number }>('key');
    expect(stored).toEqual({ value: 123 });
  });

  it('expires items after ttl', () => {
    vi.useFakeTimers();
    const now = new Date('2024-01-01T00:00:00.000Z');
    vi.setSystemTime(now);

    setExpiringSessionItem('expiring', 'value', 1000);
    vi.setSystemTime(new Date(now.getTime() + 1001));

    const stored = getExpiringSessionItem('expiring');
    expect(stored).toBeNull();
    expect(sessionStorage.getItem('expiring')).toBeNull();
  });

  it('rewraps legacy payloads with default ttl', () => {
    sessionStorage.setItem('legacy', JSON.stringify({ hello: 'world' }));

    const stored = getExpiringSessionItem<{ hello: string }>('legacy');
    expect(stored).toEqual({ hello: 'world' });

    const raw = sessionStorage.getItem('legacy');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw as string) as { value: { hello: string }; expiresAt: number; createdAt: number };
    expect(parsed.value).toEqual({ hello: 'world' });
    expect(parsed.expiresAt - parsed.createdAt).toBe(DEFAULT_PII_TTL_MS);
  });

  it('sets, gets, and removes session items', () => {
    setSessionItem('plain', 'hello');
    expect(getSessionItem('plain')).toBe('hello');

    removeSessionItem('plain');
    expect(getSessionItem('plain')).toBeNull();
  });
});
