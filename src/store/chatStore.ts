import { create } from 'zustand';
import { sendMessage } from '../services/chatService';
import { qualificationService } from '../services/qualificationService';
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

    const updateQualificationStatus = async () => {
      const currentState = get();
      try {
        const updated = await qualificationService.assessQualificationFromMessages(
          currentState.messages,
          currentState.qualificationStatus
        );

        set(s => {
          const nextStatus = { ...s.qualificationStatus, ...updated };
          const nextScore = typeof updated.score === 'number' ? updated.score : nextStatus.score;
          return {
            qualificationStatus: nextStatus,
            qualificationScore: nextScore,
            isQualified: nextScore >= 75,
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

      await updateQualificationStatus();
      
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

// Selector hooks for components
export const useMessages = () => useChatStore(s => s.messages);
export const useIsTyping = () => useChatStore(s => s.isTyping);
export const useProspectInfo = () => useChatStore(s => s.prospectInfo);
export const useQualificationScore = () => useChatStore(s => s.qualificationScore);
export const useError = () => useChatStore(s => s.error);
