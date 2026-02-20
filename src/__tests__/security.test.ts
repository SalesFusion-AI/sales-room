import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { sanitizeInput, isSuspiciousInput, RateLimiter, CSPHelpers } from '../utils/security';

describe('security utilities', () => {
  it('sanitizes input based on options', () => {
    const sanitized = sanitizeInput('  Hello\n\n\nWorld <b>Test</b>  ', {
      allowHtml: false,
      allowNewlines: true,
      maxLength: 20,
      preserveCase: true,
    });
    expect(sanitized).toBe('Hello\n\nWorld Tes');
  });

  it('detects suspicious input patterns', () => {
    const result = isSuspiciousInput('DROP TABLE users;');
    expect(result.suspicious).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('rate limits repeated requests', () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.isAllowed('user')).toBe(true);
    expect(limiter.isAllowed('user')).toBe(true);
    expect(limiter.isAllowed('user')).toBe(false);
    expect(limiter.getRemainingRequests('user')).toBe(0);
  });

  it('generates CSP nonces and validates redirect URLs', () => {
    const nonce = CSPHelpers.generateNonce();
    expect(nonce).toHaveLength(32);
    expect(CSPHelpers.isSafeRedirectUrl('https://example.com')).toBe(true);
    expect(CSPHelpers.isSafeRedirectUrl('javascript:alert(1)')).toBe(false);
  });

  describe('isSafeRedirectUrl production rules', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('blocks localhost in production', () => {
      expect(CSPHelpers.isSafeRedirectUrl('http://localhost:3000')).toBe(false);
    });
  });
});
