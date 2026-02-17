/**
 * Security utilities for input sanitization and validation
 */

export interface SanitizationOptions {
  maxLength?: number;
  allowNewlines?: boolean;
  allowHtml?: boolean;
  preserveCase?: boolean;
}

/**
 * Advanced input sanitization with configurable options
 */
export function sanitizeInput(
  input: string, 
  options: SanitizationOptions = {}
): string {
  const {
    maxLength = 10000,
    allowNewlines = true,
    allowHtml = false,
    preserveCase = true,
  } = options;

  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Apply length limit early
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove HTML if not allowed
  if (!allowHtml) {
    // Remove all HTML tags and attributes
    sanitized = sanitized
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      // Remove HTML entities
      .replace(/&[#\w]+;/g, '');
  }

  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');
  } else {
    // Normalize newlines and limit consecutive breaks
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/[ \t]+/g, ' ');

  // Case handling
  if (!preserveCase) {
    sanitized = sanitized.toLowerCase();
  }

  return sanitized.trim();
}

/**
 * Check for suspicious patterns that might indicate malicious input
 */
export function isSuspiciousInput(input: string): { 
  suspicious: boolean; 
  reasons: string[] 
} {
  const reasons: string[] = [];
  
  // Check for script injection attempts
  if (/<script|javascript:|vbscript:|data:text\/html/i.test(input)) {
    reasons.push('Script injection patterns detected');
  }
  
  // Check for SQL injection patterns
  if /(union|select|drop|insert|update|delete)[\s\w]*\b/i.test(input)) {
    reasons.push('SQL injection patterns detected');
  }
  
  // Check for command injection
  if (/[;&|`$(){}[\]]/g.test(input)) {
    const suspiciousChars = input.match(/[;&|`$(){}[\]]/g);
    if (suspiciousChars && suspiciousChars.length > 2) {
      reasons.push('Command injection patterns detected');
    }
  }
  
  // Check for excessive special characters
  const specialCharRatio = (input.match(/[!@#$%^&*()+={}[\]:";'<>?,.~`]/g) || []).length / input.length;
  if (specialCharRatio > 0.5) {
    reasons.push('Excessive special characters');
  }
  
  // Check for very long words (potential buffer overflow)
  const words = input.split(/\s+/);
  const hasVeryLongWord = words.some(word => word.length > 100);
  if (hasVeryLongWord) {
    reasons.push('Unusually long words detected');
  }
  
  // Check for repeated characters (potential DoS)
  if (/(.)\1{50,}/.test(input)) {
    reasons.push('Excessive character repetition');
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Rate limiting utility for preventing abuse
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

/**
 * Content Security Policy helpers
 */
export const CSPHelpers = {
  /**
   * Generate a CSP nonce for inline scripts/styles
   */
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate that a URL is safe for redirects
   */
  isSafeRedirectUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Block localhost in production
      if (process.env.NODE_ENV === 'production' && 
          ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname)) {
        return false;
      }
      
      // Block private IP ranges in production
      if (process.env.NODE_ENV === 'production') {
        const ip = parsedUrl.hostname;
        if (/^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }
};

export default {
  sanitizeInput,
  isSuspiciousInput,
  RateLimiter,
  CSPHelpers,
};