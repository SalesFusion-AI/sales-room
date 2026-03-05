/**
 * Input validation utilities for the Sales Room application
 */

import { sanitizeInput as securitySanitize, isSuspiciousInput } from './security';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface MessageValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowEmpty?: boolean;
}

export interface EmailValidationOptions {
  required?: boolean;
}

export interface NameValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

/**
 * Validate chat message input
 */
export function validateMessage(
  message: string,
  options: MessageValidationOptions = {}
): ValidationResult {
  const {
    maxLength = 500,
    minLength = 1,
    allowEmpty = false
  } = options;

  // Check if empty
  if (!message || !message.trim()) {
    if (allowEmpty) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: 'Message cannot be empty'
    };
  }

  const trimmedMessage = message.trim();

  // Sanitize early for XSS prevention
  const sanitizedMessage = sanitizeInput(trimmedMessage, maxLength);
  const normalizedMessage = sanitizedMessage.trim();

  if (!normalizedMessage) {
    return {
      isValid: false,
      error: 'Message contains invalid content'
    };
  }

  // Check minimum length
  if (normalizedMessage.length < minLength) {
    return {
      isValid: false,
      error: `Message must be at least ${minLength} character${minLength > 1 ? 's' : ''} long`
    };
  }

  // Check maximum length
  if (normalizedMessage.length > maxLength) {
    return {
      isValid: false,
      error: `Message cannot exceed ${maxLength} characters`
    };
  }

  // Check for potentially malicious content (basic XSS prevention)
  if (containsMaliciousContent(trimmedMessage)) {
    return {
      isValid: false,
      error: 'Message contains invalid content'
    };
  }

  // Check for suspicious patterns using security utility
  const suspiciousCheck = isSuspiciousInput(trimmedMessage);
  if (suspiciousCheck.suspicious) {
    return {
      isValid: false,
      error: 'Message contains potentially harmful content'
    };
  }

  // Check for excessive whitespace or special characters
  if (isExcessivelyFormatted(normalizedMessage)) {
    return {
      isValid: false,
      error: 'Message contains excessive formatting or special characters'
    };
  }

  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {}
): ValidationResult {
  const { required = false } = options;

  // Check if empty and required
  if (!email || !email.trim()) {
    if (required) {
      return {
        isValid: false,
        error: 'Email address is required'
      };
    }
    return { isValid: true };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Check for reasonable length (most email providers have limits)
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long'
    };
  }

  const emailParts = trimmedEmail.split('@');
  if (emailParts.length !== 2) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  const [localPart, domain] = emailParts;

  if (!localPart || !domain) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email address is too long'
    };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || /\.\./.test(localPart)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  if (domain.startsWith('-') || domain.endsWith('-') || /\.\./.test(domain)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Validate local part characters
  const localPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
  if (!localPattern.test(localPart)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Validate domain labels
  const domainLabels = domain.split('.');
  if (domainLabels.length < 2) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  const labelPattern = /^[a-z0-9-]+$/i;
  for (const label of domainLabels) {
    if (!label || label.length > 63) {
      return {
        isValid: false,
        error: 'Please enter a valid email address'
      };
    }
    if (!labelPattern.test(label) || label.startsWith('-') || label.endsWith('-')) {
      return {
        isValid: false,
        error: 'Please enter a valid email address'
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate name input
 */
export function validateName(
  name: string,
  options: NameValidationOptions = {}
): ValidationResult {
  const {
    required = false,
    minLength = 2,
    maxLength = 50
  } = options;

  // Check if empty and required
  if (!name || !name.trim()) {
    if (required) {
      return {
        isValid: false,
        error: 'Name is required'
      };
    }
    return { isValid: true };
  }

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < minLength) {
    return {
      isValid: false,
      error: `Name must be at least ${minLength} characters long`
    };
  }

  // Check maximum length
  if (trimmedName.length > maxLength) {
    return {
      isValid: false,
      error: `Name cannot exceed ${maxLength} characters`
    };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const namePattern = /^[a-zA-Z\s\-'.]+$/;
  if (!namePattern.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }

  // Check for reasonable formatting (no excessive spaces)
  if (/\s{2,}/.test(trimmedName) || trimmedName.startsWith(' ') || trimmedName.endsWith(' ')) {
    return {
      isValid: false,
      error: 'Name contains invalid formatting'
    };
  }

  return { isValid: true };
}

/**
 * Validate company name
 */
export function validateCompany(company: string): ValidationResult {
  if (!company || !company.trim()) {
    return { isValid: true }; // Company is optional
  }

  const trimmedCompany = company.trim();

  // Check maximum length
  if (trimmedCompany.length > 100) {
    return {
      isValid: false,
      error: 'Company name cannot exceed 100 characters'
    };
  }

  // Allow letters, numbers, spaces, and common business punctuation
  const companyPattern = /^[a-zA-Z0-9\s\-&.,()]+$/;
  if (!companyPattern.test(trimmedCompany)) {
    return {
      isValid: false,
      error: 'Company name contains invalid characters'
    };
  }

  return { isValid: true };
}

/**
 * Check for potentially malicious content
 */
function containsMaliciousContent(text: string): boolean {
  const maliciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /onclick\s*=/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi
  ];

  return maliciousPatterns.some(pattern => pattern.test(text));
}

/**
 * Check for excessive formatting that might indicate spam or abuse
 */
function isExcessivelyFormatted(text: string): boolean {
  // Check for excessive repeated characters
  if (/(.)\1{10,}/.test(text)) {
    return true;
  }

  // Check for excessive special characters
  const specialCharCount = (text.match(/[!@#$%^&*()_+={}[\]:";'<>?,./~`]/g) || []).length;
  if (specialCharCount > text.length * 0.3) {
    return true;
  }

  // Check for excessive uppercase
  const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
  if (uppercaseCount > text.length * 0.7 && text.length > 10) {
    return true;
  }

  return false;
}

/**
 * Sanitize user input by removing potentially dangerous content
 * Uses the security utility for comprehensive sanitization
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  const sanitized = securitySanitize(input, {
    maxLength,
    allowNewlines: true,
    allowHtml: false,
    preserveCase: true,
  });

  // Strip control characters (except newlines already normalized)
  // eslint-disable-next-line no-control-regex
  return sanitized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

/**
 * Comprehensive input validation for prospect information
 */
export interface ProspectInfo {
  name?: string;
  email?: string;
  company?: string;
  title?: string;
  phone?: string;
}

export function validateProspectInfo(info: ProspectInfo): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (info.name !== undefined) {
    const nameResult = validateName(info.name, { required: false });
    if (!nameResult.isValid && nameResult.error) {
      errors.name = nameResult.error;
    }
  }

  if (info.email !== undefined) {
    const emailResult = validateEmail(info.email, { required: false });
    if (!emailResult.isValid && emailResult.error) {
      errors.email = emailResult.error;
    }
  }

  if (info.company !== undefined) {
    const companyResult = validateCompany(info.company);
    if (!companyResult.isValid && companyResult.error) {
      errors.company = companyResult.error;
    }
  }

  if (info.title !== undefined) {
    const titleResult = validateTitle(info.title);
    if (!titleResult.isValid && titleResult.error) {
      errors.title = titleResult.error;
    }
  }

  if (info.phone !== undefined) {
    const phoneResult = validatePhone(info.phone);
    if (!phoneResult.isValid && phoneResult.error) {
      errors.phone = phoneResult.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate job title
 */
export function validateTitle(title: string): ValidationResult {
  if (!title || !title.trim()) {
    return { isValid: true };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length > 100) {
    return {
      isValid: false,
      error: 'Title cannot exceed 100 characters'
    };
  }

  const titlePattern = /^[a-zA-Z0-9\s\-&/.,'()]+$/;
  if (!titlePattern.test(trimmedTitle)) {
    return {
      isValid: false,
      error: 'Title contains invalid characters'
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: true };
  }

  const trimmedPhone = phone.trim();

  if (trimmedPhone.length > 25) {
    return {
      isValid: false,
      error: 'Phone number is too long'
    };
  }

  const phonePattern = /^[0-9+\-().\sxext]+$/i;
  if (!phonePattern.test(trimmedPhone)) {
    return {
      isValid: false,
      error: 'Phone number contains invalid characters'
    };
  }

  const digitCount = trimmedPhone.replace(/\D/g, '').length;
  if (digitCount < 7 || digitCount > 15) {
    return {
      isValid: false,
      error: 'Phone number length is invalid'
    };
  }

  return { isValid: true };
}
