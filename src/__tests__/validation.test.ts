import { describe, expect, it } from 'vitest';
import {
  validateMessage,
  validateEmail,
  validateName,
  validateCompany,
  sanitizeInput,
  validateProspectInfo,
} from '../utils/validation';

describe('validation utilities', () => {
  it('validates messages with length and content rules', () => {
    expect(validateMessage('')).toEqual({ isValid: false, error: 'Message cannot be empty' });
    expect(validateMessage('ok', { minLength: 3 }).isValid).toBe(false);
    expect(validateMessage('hello', { minLength: 3 }).isValid).toBe(true);
    expect(validateMessage('<script>alert(1)</script>').isValid).toBe(false);
  });

  it('validates email addresses', () => {
    expect(validateEmail('', { required: true }).isValid).toBe(false);
    expect(validateEmail('not-an-email').isValid).toBe(false);
    expect(validateEmail('test@example.com').isValid).toBe(true);
  });

  it('validates names and companies', () => {
    expect(validateName('', { required: true }).isValid).toBe(false);
    expect(validateName('A').isValid).toBe(false);
    expect(validateName("O'Connor").isValid).toBe(true);
    expect(validateCompany('Acme, Inc.').isValid).toBe(true);
    expect(validateCompany('Bad<Co>').isValid).toBe(false);
  });

  it('sanitizes input via security utilities', () => {
    const sanitized = sanitizeInput('  Hello <b>World</b>  ');
    expect(sanitized).toBe('Hello World');
  });

  it('validates prospect info and reports errors', () => {
    const result = validateProspectInfo({
      name: 'A',
      email: 'bad-email',
      company: 'Acme',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.company).toBeUndefined();
  });
});
