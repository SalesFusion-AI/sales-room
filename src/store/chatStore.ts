import { create } from 'zustand';
import { sendMessage } from '../services/chatService';
import { qualificationService } from '../services/qualificationService';
import { demoService } from '../demo/demoService';
import type { QualificationStatus } from '../types';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ProspectInfo {
  name: string;
  company: string;
  email: string;
}

interface ChatStore {
  messages: Message[];
  isTyping: boolean;
  sessionId: string | null;
  prospectInfo: ProspectInfo;
  isQualified: boolean;
  qualificationScore: number;
  qualificationStatus: QualificationStatus;
  demoQualificationSignals: {
    budget: boolean;
    timeline: boolean;
    painPoint: boolean;
    nameCompany: boolean;
    demoPricing: boolean;
  };
  error: string | null;
  
  // Actions
  sendUserMessage: (content: string) => Promise<void>;
  setProspectInfo: (info: Partial<ProspectInfo>) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [
    {
      id: '1',
      content: "Hi! I'm here to help you learn about our AI sales platform. What brings you here today?",
      role: 'assistant',
      timestamp: new Date(),
    }
  ],
  isTyping: false,
  sessionId: null,
  prospectInfo: {
    name: '',
    company: '',
    email: '',
  },
  isQualified: false,
  qualificationScore: 0,
  qualificationStatus: qualificationService.initializeQualificationStatus(),
  demoQualificationSignals: {
    budget: false,
    timeline: false,
    painPoint: false,
    nameCompany: false,
    demoPricing: false,
  },
  error: null,
  
  sendUserMessage: async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    set(s => ({
      messages: [...s.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    const updateQualificationStatus = async (options?: { messageContent?: string; demoMode?: boolean }) => {
      const currentState = get();
      try {
        const updated = await qualificationService.assessQualificationFromMessages(
          currentState.messages,
          currentState.qualificationStatus
        );

        set(s => {
          const nextStatus = { ...s.qualificationStatus, ...updated };
          const baseScore = typeof updated.score === 'number' ? updated.score : nextStatus.score;
          let nextScore = baseScore;
          let nextSignals = s.demoQualificationSignals;

          if (options?.demoMode) {
            const demoUpdate = getDemoQualificationUpdate(options.messageContent ?? '', s.demoQualificationSignals, s.prospectInfo);
            nextSignals = demoUpdate.signals;
            if (demoUpdate.increment > 0) {
              nextScore = Math.min(100, Math.max(baseScore, s.qualificationScore) + demoUpdate.increment);
            } else {
              nextScore = Math.max(baseScore, s.qualificationScore);
            }
          }

          return {
            qualificationStatus: nextStatus,
            qualificationScore: nextScore,
            isQualified: nextScore >= 75,
            demoQualificationSignals: nextSignals,
          };
        });
      } catch (qualificationError) {
        console.warn('Failed to update qualification status:', qualificationError);
      }
    };

    await updateQualificationStatus();
    
    try {
      const state = get();

      // Build context from conversation history
      const previousMessages = state.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      // Call API
      const response = await sendMessage(content, state.sessionId, {
        prospectName: state.prospectInfo.name,
        company: state.prospectInfo.company,
        email: state.prospectInfo.email,
        previousMessages,
      });
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      set(s => ({
        messages: [...s.messages, aiMessage],
        isTyping: false,
        sessionId: response.sessionId,
      }));

      const demoMode = demoService.isDemoActive() || isDemoSessionId(response.sessionId) || isDemoSessionId(state.sessionId);
      await updateQualificationStatus({ messageContent: content, demoMode });
      
      // Extract prospect info from conversation if mentioned
      extractProspectInfo(content, set);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      set({
        isTyping: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  },
  
  setProspectInfo: (info: Partial<ProspectInfo>) => {
    set(s => ({
      prospectInfo: { ...s.prospectInfo, ...info },
    }));
  },
  
  clearChat: () => {
    set({
      messages: [
        {
          id: '1',
          content: "Hi! I'm here to help you learn about our AI sales platform. What brings you here today?",
          role: 'assistant',
          timestamp: new Date(),
        }
      ],
      sessionId: null,
      isQualified: false,
      qualificationScore: 0,
      qualificationStatus: qualificationService.initializeQualificationStatus(),
      demoQualificationSignals: {
        budget: false,
        timeline: false,
        painPoint: false,
        nameCompany: false,
        demoPricing: false,
      },
      error: null,
    });
  },
}));

// Helper to extract prospect info from messages
function extractProspectInfo(
  message: string,
  set: (fn: (s: ChatStore) => Partial<ChatStore>) => void
) {
  const lowerMessage = message.toLowerCase();
  
  // Extract name
  const nameMatch = message.match(/(?:i'm |my name is |i am )([A-Z][a-z]+ ?[A-Z]?[a-z]*)/i);
  if (nameMatch) {
    set(s => ({
      prospectInfo: { ...s.prospectInfo, name: nameMatch[1].trim() },
    }));
  }
  
  // Extract company
  const companyMatch = message.match(/(?:work at |work for |company is |at )([A-Z][a-zA-Z0-9 ]+)/i);
  if (companyMatch) {
    set(s => ({
      prospectInfo: { ...s.prospectInfo, company: companyMatch[1].trim() },
    }));
  }
  
  // Extract email
  const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    set(s => ({
      prospectInfo: { ...s.prospectInfo, email: emailMatch[1] },
    }));
  }
}

const isDemoSessionId = (sessionId: string | null): boolean => {
  if (!sessionId) return false;
  return sessionId.startsWith('demo_') || sessionId.startsWith('demo-session');
};

const getDemoQualificationUpdate = (
  message: string,
  signals: ChatStore['demoQualificationSignals'],
  prospectInfo: ProspectInfo
) => {
  const lowerMessage = message.toLowerCase();
  let increment = 0;
  const nextSignals = { ...signals };

  if (!signals.budget && /budget|pricing|price|cost|invest|roi|spend/.test(lowerMessage)) {
    increment += 20;
    nextSignals.budget = true;
  }

  if (!signals.timeline && /timeline|timeframe|next month|next quarter|this quarter|by\s\w+|asap|soon|weeks?/.test(lowerMessage)) {
    increment += 15;
    nextSignals.timeline = true;
  }

  if (!signals.painPoint && /pain|problem|challenge|struggl|manual|slow|inefficient|leads?\sfalling|response time/.test(lowerMessage)) {
    increment += 15;
    nextSignals.painPoint = true;
  }

  const nameCompanyMentioned =
    /my name is|i'm |i am |we're |we are |at\s+[a-z0-9&\- ]+/i.test(message) ||
    Boolean(prospectInfo.name) ||
    Boolean(prospectInfo.company);

  if (!signals.nameCompany && nameCompanyMentioned) {
    increment += 10;
    nextSignals.nameCompany = true;
  }

  if (!signals.demoPricing && /demo|pricing|quote|proposal|see it|trial/.test(lowerMessage)) {
    increment += 15;
    nextSignals.demoPricing = true;
  }

  return { increment, signals: nextSignals };
};

// Selector hooks for components
export const useMessages = () => useChatStore(s => s.messages);
export const useIsTyping = () => useChatStore(s => s.isTyping);
export const useProspectInfo = () => useChatStore(s => s.prospectInfo);
export const useQualificationScore = () => useChatStore(s => s.qualificationScore);
export const useError = () => useChatStore(s => s.error);
