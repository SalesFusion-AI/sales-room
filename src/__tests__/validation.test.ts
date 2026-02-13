import { describe, it, expect } from 'vitest';
import {
  validateMessage,
  validateEmail,
  validateName,
  validateCompany,
  sanitizeInput,
  validateProspectInfo
} from '../utils/validation';

describe('validation utilities', () => {
  it('rejects empty message by default', () => {
    const result = validateMessage('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message cannot be empty');
  });

  it('allows empty message when allowEmpty is true', () => {
    const result = validateMessage(' ', { allowEmpty: true });
    expect(result.isValid).toBe(true);
  });

  it('rejects messages that exceed max length', () => {
    const result = validateMessage('a'.repeat(6), { maxLength: 5 });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message cannot exceed 5 characters');
  });

  it('rejects messages with malicious content', () => {
    const result = validateMessage('<script>alert(1)</script>');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message contains invalid content');
  });

  it('rejects messages with excessive formatting', () => {
    const result = validateMessage('!!!!!!!!!!!!!!!!!');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message contains excessive formatting or special characters');
  });

  it('validates email when required', () => {
    const result = validateEmail('', { required: true });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email address is required');
  });

  it('rejects invalid email format', () => {
    const result = validateEmail('invalid@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('rejects names with invalid characters', () => {
    const result = validateName('John123');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name can only contain letters, spaces, hyphens, and apostrophes');
  });

  it('rejects company names with invalid characters', () => {
    const result = validateCompany('Bad Co 💥');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Company name contains invalid characters');
  });

  it('sanitizes input and strips unsafe tags', () => {
    const result = sanitizeInput('  Hello <script>alert(1)</script>  world  ');
    expect(result).toBe('Hello world');
  });

  it('aggregates validation errors for prospect info', () => {
    const result = validateProspectInfo({
      name: 'J',
      email: 'bad-email',
      company: 'Company 💥'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      name: 'Name must be at least 2 characters long',
      email: 'Please enter a valid email address',
      company: 'Company name contains invalid characters'
    });
  });
});
