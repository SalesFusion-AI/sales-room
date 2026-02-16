// Performance utilities for development monitoring

export const measureRenderTime = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    return {
      start: () => performance.mark(`${componentName}-start`),
      end: () => {
        performance.mark(`${componentName}-end`);
        performance.measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`);
        
        const measure = performance.getEntriesByName(`${componentName}-render`)[0];
        if (measure && measure.duration > 16) { // Warn if render takes > 16ms (60fps threshold)
          console.warn(`🐌 Slow render detected in ${componentName}: ${measure.duration.toFixed(2)}ms`);
        }
        
        // Clean up marks and measures
        performance.clearMarks(`${componentName}-start`);
        performance.clearMarks(`${componentName}-end`);
        performance.clearMeasures(`${componentName}-render`);
      }
    };
  }
  
  // No-op for production
  return {
    start: () => {},
    end: () => {}
  };
};

// Debounce utility for performance-sensitive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Throttle utility for scroll/resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization utility for expensive computations
export const memoize = <T extends (...args: any[]) => any>(fn: T, maxCacheSize = 10) => {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    
    // Implement LRU cache behavior
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, result);
    return result;
  };
};