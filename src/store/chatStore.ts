import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, ProspectInfo, QualificationStatus, ChatState, BrandConfig } from '../types';

interface ChatStore {
  // State
  conversation: Conversation;
  isTyping: boolean;
  isQualified: boolean;
  showConnectOption: boolean;
  availabilityStatus: 'online' | 'offline' | 'busy';
  brandConfig: BrandConfig | null;
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant', metadata?: Message['metadata']) => void;
  updateProspectInfo: (info: Partial<ProspectInfo>) => void;
  updateQualificationStatus: (status: Partial<QualificationStatus>) => void;
  setTyping: (typing: boolean) => void;
  setBrandConfig: (config: BrandConfig) => void;
  clearConversation: () => void;
  
  // Computed
  getQualificationScore: () => number;
  isReadyToConnect: () => boolean;
}

const initialProspect: ProspectInfo = {
  id: uuidv4(),
  painPoints: [],
};

const initialQualification: QualificationStatus = {
  budget: 'unknown',
  authority: 'unknown', 
  need: 'unknown',
  timeline: 'unknown',
  score: 0,
  readyToConnect: false,
};

const initialConversation: Conversation = {
  id: uuidv4(),
  sessionId: uuidv4(),
  messages: [],
  prospect: initialProspect,
  qualificationStatus: initialQualification,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversation: initialConversation,
  isTyping: false,
  isQualified: false,
  showConnectOption: false,
  availabilityStatus: 'online',
  brandConfig: null,
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant', metadata?: Message['metadata']) => {
    const message: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date(),
      metadata,
    };
    
    set((state) => ({
      conversation: {
        ...state.conversation,
        messages: [...state.conversation.messages, message],
        updatedAt: new Date(),
      },
    }));
    
    // Auto-update qualification based on message content
    if (role === 'user' && metadata?.type === 'qualification') {
      get().updateQualificationFromMessage(content, metadata);
    }
  },
  
  updateProspectInfo: (info: Partial<ProspectInfo>) => {
    set((state) => ({
      conversation: {
        ...state.conversation,
        prospect: {
          ...state.conversation.prospect,
          ...info,
        },
        updatedAt: new Date(),
      },
    }));
  },
  
  updateQualificationStatus: (status: Partial<QualificationStatus>) => {
    set((state) => {
      const newQualificationStatus = {
        ...state.conversation.qualificationStatus,
        ...status,
      };
      
      // Calculate score
      const qualifiedCount = [
        newQualificationStatus.budget,
        newQualificationStatus.authority,
        newQualificationStatus.need,
        newQualificationStatus.timeline,
      ].filter(s => s === 'qualified').length;
      
      newQualificationStatus.score = (qualifiedCount / 4) * 100;
      newQualificationStatus.readyToConnect = newQualificationStatus.score >= 75;
      
      return {
        conversation: {
          ...state.conversation,
          qualificationStatus: newQualificationStatus,
          updatedAt: new Date(),
        },
        isQualified: newQualificationStatus.score >= 50,
        showConnectOption: newQualificationStatus.readyToConnect,
      };
    });
  },
  
  setTyping: (typing: boolean) => {
    set({ isTyping: typing });
  },
  
  setBrandConfig: (config: BrandConfig) => {
    set({ brandConfig: config });
    // Apply brand colors to CSS variables
    document.documentElement.style.setProperty('--primary-500', config.branding.colors.primary);
    document.documentElement.style.setProperty('--secondary-500', config.branding.colors.secondary);
    document.documentElement.style.setProperty('--accent-500', config.branding.colors.accent);
  },
  
  clearConversation: () => {
    set({
      conversation: {
        ...initialConversation,
        id: uuidv4(),
        sessionId: uuidv4(),
        createdAt: new Date(),
      },
      isQualified: false,
      showConnectOption: false,
    });
  },
  
  // Computed getters
  getQualificationScore: () => {
    return get().conversation.qualificationStatus.score;
  },
  
  isReadyToConnect: () => {
    return get().conversation.qualificationStatus.readyToConnect;
  },
  
  // Helper methods (not part of the store interface but useful)
  updateQualificationFromMessage: (content: string, metadata?: Message['metadata']) => {
    const lowerContent = content.toLowerCase();
    const updates: Partial<QualificationStatus> = {};
    
    // Budget qualification patterns
    if (lowerContent.includes('budget') || lowerContent.includes('price') || lowerContent.includes('cost')) {
      if (lowerContent.includes('approved') || lowerContent.includes('allocated') || /\$[\d,]+/.test(content)) {
        updates.budget = 'qualified';
      } else if (lowerContent.includes('no budget') || lowerContent.includes("can't afford")) {
        updates.budget = 'unqualified';
      }
    }
    
    // Authority qualification patterns
    if (lowerContent.includes('decision') || lowerContent.includes('approve')) {
      if (lowerContent.includes('i make') || lowerContent.includes('i decide') || lowerContent.includes('i approve')) {
        updates.authority = 'qualified';
      } else if (lowerContent.includes('need to check') || lowerContent.includes('boss') || lowerContent.includes('team decision')) {
        updates.authority = 'unqualified';
      }
    }
    
    // Need qualification patterns
    if (lowerContent.includes('problem') || lowerContent.includes('issue') || lowerContent.includes('challenge')) {
      updates.need = 'qualified';
    }
    
    // Timeline qualification patterns
    if (lowerContent.includes('asap') || lowerContent.includes('urgent') || lowerContent.includes('this week') || lowerContent.includes('this month')) {
      updates.timeline = 'qualified';
    } else if (lowerContent.includes('next year') || lowerContent.includes('maybe later') || lowerContent.includes('not urgent')) {
      updates.timeline = 'unqualified';
    }
    
    if (Object.keys(updates).length > 0) {
      get().updateQualificationStatus(updates);
    }
  },
}));

// Selector hooks for performance
export const useMessages = () => useChatStore(state => state.conversation.messages);
export const useProspectInfo = () => useChatStore(state => state.conversation.prospect);
export const useQualificationStatus = () => useChatStore(state => state.conversation.qualificationStatus);
export const useIsTyping = () => useChatStore(state => state.isTyping);
export const useBrandConfig = () => useChatStore(state => state.brandConfig);