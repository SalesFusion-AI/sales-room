/**
 * Qualification Configuration
 * 
 * Customize how prospects are scored and when they're considered "qualified"
 * for a sales handoff. These settings can be overridden per-deployment.
 */

export interface QualificationCriteria {
  /** Minimum score to show "Talk to Sales" button */
  handoffThreshold: number;
  
  /** Score weights for each qualification signal */
  weights: {
    budget: number;
    timeline: number;
    painPoint: number;
    contactInfo: number;
    demoInterest: number;
  };
  
  /** Keywords that trigger each qualification signal */
  keywords: {
    budget: string[];
    timeline: string[];
    painPoint: string[];
    demoInterest: string[];
  };
  
  /** Minimum score change before notifying Slack */
  slackNotificationThreshold: number;
}

export const defaultQualificationConfig: QualificationCriteria = {
  handoffThreshold: 75,
  
  weights: {
    budget: 20,
    timeline: 15,
    painPoint: 15,
    contactInfo: 10,
    demoInterest: 15,
  },
  
  keywords: {
    budget: [
      'budget',
      'pricing',
      'price',
      'cost',
      'invest',
      'roi',
      'spend',
      'afford',
      'pay',
      'subscription',
      'monthly',
      'annual',
    ],
    timeline: [
      'timeline',
      'timeframe',
      'next month',
      'next quarter',
      'this quarter',
      'by end of',
      'asap',
      'soon',
      'urgent',
      'immediately',
      'weeks',
      'days',
    ],
    painPoint: [
      'pain',
      'problem',
      'challenge',
      'struggle',
      'manual',
      'slow',
      'inefficient',
      'frustrated',
      'time-consuming',
      'bottleneck',
      'difficult',
      'broken',
    ],
    demoInterest: [
      'demo',
      'trial',
      'see it',
      'show me',
      'walkthrough',
      'presentation',
      'call',
      'meeting',
      'schedule',
      'book',
    ],
  },
  
  slackNotificationThreshold: 10,
};

/**
 * Get the current qualification config
 * Can be extended to load from environment or API
 */
export function getQualificationConfig(): QualificationCriteria {
  // In the future, this could merge with environment-specific overrides
  // or fetch from a config API
  return defaultQualificationConfig;
}

/**
 * Calculate qualification score from signals
 */
export function calculateScore(signals: {
  budget: boolean;
  timeline: boolean;
  painPoint: boolean;
  contactInfo: boolean;
  demoInterest: boolean;
}): number {
  const config = getQualificationConfig();
  let score = 0;
  
  if (signals.budget) score += config.weights.budget;
  if (signals.timeline) score += config.weights.timeline;
  if (signals.painPoint) score += config.weights.painPoint;
  if (signals.contactInfo) score += config.weights.contactInfo;
  if (signals.demoInterest) score += config.weights.demoInterest;
  
  return Math.min(100, score);
}

/**
 * Check if a message contains keywords for a signal type
 */
export function detectSignal(
  message: string,
  signalType: keyof QualificationCriteria['keywords']
): boolean {
  const config = getQualificationConfig();
  const keywords = config.keywords[signalType];
  const lowerMessage = message.toLowerCase();
  
  return keywords.some(keyword => lowerMessage.includes(keyword));
}
