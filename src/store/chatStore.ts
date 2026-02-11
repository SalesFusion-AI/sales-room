import { create } from 'zustand';
import { sendMessage } from '../services/chatService';
import { qualificationService } from '../services/qualificationService';
import { demoService } from '../demo/demoService';
import { getRelevantContent, type ContentCardData } from '../components/ContentCard';
import type { QualificationStatus } from '../types';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  contentCards?: ContentCardData[];
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
  pendingRequestId: string | null;
  
  // Actions
  sendUserMessage: (content: string) => Promise<void>;
  setProspectInfo: (info: Partial<ProspectInfo>) => void;
  clearChat: () => void;
  loadDemoScenario: () => Promise<void>;
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
  pendingRequestId: null,
  
  sendUserMessage: async (content: string) => {
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      set({ error: 'Please enter a message before sending.' });
      return;
    }
    if (normalizedContent.length > 500) {
      set({ error: 'Message is too long. Please keep it under 500 characters.' });
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // Add user message immediately
    const userMessage: Message = {
      id: requestId,
      content: normalizedContent,
      role: 'user',
      timestamp: new Date(),
    };

    set(s => ({
      messages: [...s.messages, userMessage],
      isTyping: true,
      error: null,
      pendingRequestId: requestId,
    }));

    const updateQualificationStatus = async (
      messages: Message[],
      options?: { messageContent?: string; demoMode?: boolean }
    ) => {
      const currentState = get();
      try {
        const updated = await qualificationService.assessQualificationFromMessages(
          messages,
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

    const messagesSnapshot = get().messages;
    await updateQualificationStatus(messagesSnapshot);

    try {
      const state = get();

      // Build context from conversation history
      const previousMessages = state.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call API
      const response = await sendMessage(normalizedContent, state.sessionId, {
        prospectName: state.prospectInfo.name,
        company: state.prospectInfo.company,
        email: state.prospectInfo.email,
        previousMessages,
      });

      if (get().pendingRequestId !== requestId) {
        return;
      }

      // Add AI response with relevant content cards
      // Check both user message and AI response for content triggers
      const relevantContent = getRelevantContent(normalizedContent + ' ' + response.response);

      const aiMessage: Message = {
        id: `${requestId}-ai`,
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
        contentCards: relevantContent.length > 0 ? relevantContent : undefined,
      };

      set(s => ({
        messages: [...s.messages, aiMessage],
        isTyping: false,
        sessionId: response.sessionId,
        pendingRequestId: null,
      }));

      const demoMode = demoService.isDemoActive() || isDemoSessionId(response.sessionId) || isDemoSessionId(state.sessionId);
      await updateQualificationStatus([...get().messages, aiMessage], { messageContent: normalizedContent, demoMode });

      // Extract prospect info from conversation if mentioned
      extractProspectInfo(normalizedContent, set);

    } catch (error) {
      console.error('Failed to send message:', error);
      if (get().pendingRequestId !== requestId) {
        return;
      }
      set({
        isTyping: false,
        pendingRequestId: null,
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
      pendingRequestId: null,
    });
  },

  loadDemoScenario: async () => {
    // Load the hot lead demo conversation (TechFlow Solutions)
    const hotLeadMessages = [
      {
        id: 'demo-msg-1',
        content: "Hi, I'm Sarah Chen, VP of Engineering at TechFlow Solutions. We're evaluating workflow automation for our dev-to-QA handoffs and your platform looks promising.",
        role: 'user' as const,
        timestamp: new Date(),
      },
      {
        id: 'demo-msg-2',
        content: 'Hi Sarah! Great to meet you. Dev-to-QA handoffs are a common bottleneck at your scale. What outcomes are you hoping to improve first - speed, quality, or visibility?',
        role: 'assistant' as const,
        timestamp: new Date(),
      },
      {
        id: 'demo-msg-3',
        content: "Speed and reliability. We have budget allocated for this quarter and need to choose a vendor by end of this month. I'm the decision maker for engineering tooling.",
        role: 'user' as const,
        timestamp: new Date(),
      },
      {
        id: 'demo-msg-4',
        content: 'Perfect - budget and timeline are exactly what we need to move fast. At 300 engineers, automating those handoffs typically cuts cycle time by 60-70%. What tools are you using today for release management?',
        role: 'assistant' as const,
        timestamp: new Date(),
      },
      {
        id: 'demo-msg-5',
        content: "We run Jira + GitHub + Jenkins. The handoff process is still manual and it's slowing every sprint. We want this live within 6 months.",
        role: 'user' as const,
        timestamp: new Date(),
      },
      {
        id: 'demo-msg-6',
        content: 'Great fit. We integrate directly with Jira, GitHub, and Jenkins and can be live in weeks. Want a tailored demo this week with our solutions engineer?',
        role: 'assistant' as const,
        timestamp: new Date(),
      },
    ];

    await demoService.initializeDemoEnvironment();

    set({
      messages: hotLeadMessages,
      isTyping: false,
      sessionId: 'demo-session-001',
      prospectInfo: {
        name: 'Sarah Chen',
        company: 'TechFlow Solutions',
        email: 'sarah.chen@techflow.com',
      },
      isQualified: true,
      qualificationScore: 92,
      qualificationStatus: qualificationService.initializeQualificationStatus(),
      demoQualificationSignals: {
        budget: true,
        timeline: true,
        painPoint: true,
        nameCompany: true,
        demoPricing: true,
      },
      error: null,
      pendingRequestId: null,
    });
  },
}));

// Helper to extract prospect info from messages
function extractProspectInfo(
  message: string,
  set: (fn: (s: ChatStore) => Partial<ChatStore>) => void
) {
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
