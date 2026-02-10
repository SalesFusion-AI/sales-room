export interface QualificationConfig {
  criteria: {
    budget: {
      weight: number;
      required: boolean;
      keywords: string[];
    };
    timeline: {
      weight: number;
      required: boolean;
      keywords: string[];
    };
    painPoint: {
      weight: number;
      required: boolean;
      keywords: string[];
    };
    authority: {
      weight: number;
      required: boolean;
      keywords: string[];
    };
    need: {
      weight: number;
      required: boolean;
      keywords: string[];
    };
  };
  thresholds: {
    showTalkToSales: number;
    hotLead: number;
    warmLead: number;
    significantChange: number; // For Slack notifications
  };
  slack: {
    webhookUrl?: string;
    enabled: boolean;
    notifyOnThresholds: number[];
  };
}

// Default configuration - can be overridden by environment variables
export const defaultQualificationConfig: QualificationConfig = {
  criteria: {
    budget: {
      weight: 25,
      required: false,
      keywords: ['budget', 'pricing', 'price', 'cost', 'invest', 'roi', 'spend', 'affordable']
    },
    timeline: {
      weight: 20,
      required: false,
      keywords: ['timeline', 'timeframe', 'when', 'soon', 'asap', 'urgent', 'month', 'quarter', 'weeks']
    },
    painPoint: {
      weight: 20,
      required: true,
      keywords: ['pain', 'problem', 'challenge', 'struggling', 'difficult', 'manual', 'slow', 'inefficient', 'broken']
    },
    authority: {
      weight: 20,
      required: false,
      keywords: ['decision', 'approve', 'choose', 'decide', 'manager', 'director', 'vp', 'ceo', 'founder', 'lead']
    },
    need: {
      weight: 15,
      required: true,
      keywords: ['need', 'want', 'require', 'looking for', 'searching', 'solution', 'help', 'improve']
    }
  },
  thresholds: {
    showTalkToSales: parseInt(process.env.VITE_QUALIFICATION_THRESHOLD || '75'),
    hotLead: parseInt(process.env.VITE_HOT_LEAD_THRESHOLD || '85'),
    warmLead: parseInt(process.env.VITE_WARM_LEAD_THRESHOLD || '60'),
    significantChange: parseInt(process.env.VITE_SIGNIFICANT_CHANGE_THRESHOLD || '15')
  },
  slack: {
    webhookUrl: process.env.VITE_SLACK_WEBHOOK_URL,
    enabled: !!process.env.VITE_SLACK_WEBHOOK_URL,
    notifyOnThresholds: [60, 75, 85] // Notify when crossing these thresholds
  }
};

// Helper to get current config (allows for runtime overrides)
export const getQualificationConfig = (): QualificationConfig => {
  // In the future, this could load from a JSON file or API
  return defaultQualificationConfig;
};