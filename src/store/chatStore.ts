import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Message, 
  Conversation, 
  ProspectInfo, 
  QualificationStatus, 
  BrandConfig, 
  SalesRep,
  AvailabilityStatus,
  HandoffConfig
} from '../types';
import { qualificationService } from '../services/qualificationService';
import { handoffService } from '../services/handoffService';

interface ChatStore {
  // State
  conversation: Conversation;
  isTyping: boolean;
  isQualified: boolean;
  showConnectOption: boolean;
  availabilityStatus: AvailabilityStatus;
  assignedRep: SalesRep | null;
  handoffConfig: HandoffConfig | null;
  brandConfig: BrandConfig | null;
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant', metadata?: Message['metadata']) => void;
  updateProspectInfo: (info: Partial<ProspectInfo>) => void;
  updateQualificationStatus: (status: Partial<QualificationStatus>) => void;
  processQualificationFromMessages: () => Promise<void>;
  checkRepAvailability: () => Promise<void>;
  initiateHandoff: () => Promise<boolean>;
  setTyping: (typing: boolean) => void;
  setBrandConfig: (config: BrandConfig) => void;
  setHandoffConfig: (config: HandoffConfig) => void;
  setAssignedRep: (rep: SalesRep | null) => void;
  clearConversation: () => void;
  
  // Computed
  getQualificationScore: () => number;
  isReadyToConnect: () => boolean;
  canTalkNow: () => boolean;
}

const initialProspect: ProspectInfo = {
  id: uuidv4(),
  painPoints: [],
};

const initialQualification: QualificationStatus = qualificationService.initializeQualificationStatus();

const initialAvailability: AvailabilityStatus = {
  status: 'offline',
  lastUpdated: new Date()
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
  availabilityStatus: initialAvailability,
  assignedRep: null,
  handoffConfig: null,
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
      
      // Calculate score using the qualification service
      newQualificationStatus.score = qualificationService.calculateScore(newQualificationStatus);
      newQualificationStatus.readyToConnect = newQualificationStatus.score >= (state.handoffConfig?.scoreThresholdForHandoff || 75);
      
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

  processQualificationFromMessages: async () => {
    const state = get();
    try {
      const updatedStatus = await qualificationService.assessQualificationFromMessages(
        state.conversation.messages,
        state.conversation.qualificationStatus
      );
      
      get().updateQualificationStatus(updatedStatus);
      
      // Check if we should trigger handoff
      if (updatedStatus.readyToConnect && state.handoffConfig?.enableSlackNotifications) {
        // Send Slack notification for qualified lead
        setTimeout(() => {
          handoffService.sendSlackNotification(get().conversation);
        }, 1000); // Small delay to ensure state is updated
      }
    } catch (error) {
      console.error('Failed to process qualification:', error);
    }
  },

  checkRepAvailability: async () => {
    const state = get();
    if (!state.assignedRep) {
      // Try to get the best available rep
      try {
        const repResult = await handoffService.getBestAvailableRep();
        if (repResult) {
          set({
            assignedRep: repResult.rep,
            availabilityStatus: repResult.availability
          });
        } else {
          set({
            availabilityStatus: {
              status: 'offline',
              lastUpdated: new Date()
            }
          });
        }
      } catch (error) {
        console.error('Failed to check rep availability:', error);
      }
    } else {
      // Check specific rep availability
      try {
        const availability = await handoffService.getRepAvailability(state.assignedRep.id);
        set({ availabilityStatus: availability });
      } catch (error) {
        console.error('Failed to check assigned rep availability:', error);
      }
    }
  },

  initiateHandoff: async () => {
    const state = get();
    try {
      // Send Slack notification
      const notificationSent = await handoffService.sendSlackNotification(state.conversation);
      
      if (notificationSent) {
        // Update UI to show handoff initiated
        set({
          showConnectOption: false,
          isTyping: true
        });
        
        // Add a message about the handoff
        get().addMessage(
          "Great! I've notified our sales team about your interest. A team member will be in touch shortly to continue the conversation.",
          'assistant'
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initiate handoff:', error);
      return false;
    }
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

  setHandoffConfig: (config: HandoffConfig) => {
    set({ handoffConfig: config });
    handoffService.updateConfig(config);
  },

  setAssignedRep: (rep: SalesRep | null) => {
    set({ assignedRep: rep });
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

  canTalkNow: () => {
    const state = get();
    return state.isReadyToConnect() && 
           state.availabilityStatus.status === 'available' &&
           state.handoffConfig?.enableTalkNow === true;
  },
}));

// Selector hooks for performance
export const useMessages = () => useChatStore(state => state.conversation.messages);
export const useProspectInfo = () => useChatStore(state => state.conversation.prospect);
export const useQualificationStatus = () => useChatStore(state => state.conversation.qualificationStatus);
export const useIsTyping = () => useChatStore(state => state.isTyping);
export const useBrandConfig = () => useChatStore(state => state.brandConfig);
export const useAvailabilityStatus = () => useChatStore(state => state.availabilityStatus);
export const useAssignedRep = () => useChatStore(state => state.assignedRep);
export const useHandoffConfig = () => useChatStore(state => state.handoffConfig);
export const useCanTalkNow = () => useChatStore(state => state.canTalkNow());