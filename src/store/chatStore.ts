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
import { transcriptService } from '../services/transcriptService';
import { crmService } from '../services/crmService';

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
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  
  // Multi-session support
  sessionHistory: string[]; // Recent session IDs for this prospect
  
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
  
  // Transcript & Multi-session
  saveTranscript: () => Promise<void>;
  loadConversation: (sessionId: string) => Promise<boolean>;
  continueConversationByEmail: (email: string) => Promise<boolean>;
  generateSummary: () => Promise<void>;
  syncToCRM: () => Promise<boolean>;
  setAutoSave: (enabled: boolean) => void;
  
  // Computed
  getQualificationScore: () => number;
  isReadyToConnect: () => boolean;
  canTalkNow: () => boolean;
  hasUnsavedChanges: () => boolean;
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
  autoSaveEnabled: true,
  lastSaved: null,
  sessionHistory: [],
  
  // Actions
  
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
      // Save transcript before handoff
      await get().saveTranscript();
      
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
        
        // Auto-sync to CRM if configured
        if (state.handoffConfig?.enableSlackNotifications) {
          setTimeout(() => {
            get().syncToCRM();
          }, 1000);
        }
        
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
    // Apply brand colors to CSS variables (only in browser)
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary-500', config.branding.colors.primary);
      document.documentElement.style.setProperty('--secondary-500', config.branding.colors.secondary);
      document.documentElement.style.setProperty('--accent-500', config.branding.colors.accent);
    }
  },

  setHandoffConfig: (config: HandoffConfig) => {
    set({ handoffConfig: config });
    handoffService.updateConfig(config);
  },

  setAssignedRep: (rep: SalesRep | null) => {
    set({ assignedRep: rep });
  },

  // Auto-save transcript after each message
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

    // Auto-save after message if enabled
    if (get().autoSaveEnabled) {
      setTimeout(() => get().saveTranscript(), 500);
    }
  },

  // Save current conversation as transcript
  saveTranscript: async () => {
    const state = get();
    try {
      const storedConversation = await transcriptService.storeConversation(state.conversation);
      
      set({ 
        lastSaved: new Date(),
        conversation: {
          ...state.conversation,
          id: storedConversation.id // Update with storage ID
        }
      });
      
      console.log('Transcript saved successfully');
    } catch (error) {
      console.error('Failed to save transcript:', error);
    }
  },

  // Load existing conversation by session ID
  loadConversation: async (sessionId: string) => {
    try {
      const storedConversation = transcriptService.getConversationBySessionId(sessionId);
      
      if (storedConversation) {
        set({
          conversation: storedConversation,
          isQualified: storedConversation.qualificationStatus.score >= 50,
          showConnectOption: storedConversation.qualificationStatus.readyToConnect,
          lastSaved: new Date()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      return false;
    }
  },

  // Continue conversation for returning prospect by email
  continueConversationByEmail: async (email: string) => {
    try {
      const conversations = transcriptService.getConversationsByProspect(email);
      
      if (conversations.length > 0) {
        // Get the most recent conversation
        const latestConversation = conversations[0];
        
        // Create new session but carry over prospect info and history
        const newConversation: Conversation = {
          id: uuidv4(),
          sessionId: uuidv4(),
          messages: [],
          prospect: latestConversation.prospect, // Keep prospect info
          qualificationStatus: latestConversation.qualificationStatus, // Keep qualification
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({
          conversation: newConversation,
          isQualified: latestConversation.qualificationStatus.score >= 50,
          showConnectOption: latestConversation.qualificationStatus.readyToConnect,
          sessionHistory: conversations.map(c => c.sessionId),
          lastSaved: null
        });

        // Add welcome back message
        get().addMessage(
          `Welcome back! I see we spoke before about ${latestConversation.prospect.company ? `your work at ${latestConversation.prospect.company}` : 'your business needs'}. How can I help you today?`,
          'assistant',
          { type: 'general' }
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to continue conversation:', error);
      return false;
    }
  },

  // Generate AI summary
  generateSummary: async () => {
    const state = get();
    try {
      await transcriptService.generateSummary(state.conversation);
      console.log('Summary generated successfully');
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  },

  // Sync to CRM
  syncToCRM: async () => {
    const state = get();
    try {
      // Ensure transcript is saved first
      await get().saveTranscript();
      
      // Generate summary if needed
      let summary = transcriptService.getSummary(state.conversation.sessionId);
      if (!summary) {
        summary = await transcriptService.generateSummary(state.conversation);
      }
      
      // Get stored conversation (with tags)
      const storedConversation = transcriptService.getConversationBySessionId(state.conversation.sessionId);
      if (!storedConversation) {
        throw new Error('Conversation not found in storage');
      }

      // Sync to CRM
      const result = await crmService.syncConversation(storedConversation, summary);
      
      if (result.success) {
        // Update conversation as synced
        const updatedConversation = {
          ...storedConversation,
          crmSynced: true,
          crmId: result.crmId
        };
        
        await transcriptService.storeConversation(updatedConversation);
        console.log('Successfully synced to CRM:', result.crmId);
        return true;
      } else {
        console.error('CRM sync failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Failed to sync to CRM:', error);
      return false;
    }
  },

  // Enable/disable auto-save
  setAutoSave: (enabled: boolean) => {
    set({ autoSaveEnabled: enabled });
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

  hasUnsavedChanges: () => {
    const state = get();
    if (!state.lastSaved) return state.conversation.messages.length > 0;
    return state.conversation.updatedAt > state.lastSaved;
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
export const useSessionHistory = () => useChatStore(state => state.sessionHistory);
export const useAutoSaveEnabled = () => useChatStore(state => state.autoSaveEnabled);
export const useLastSaved = () => useChatStore(state => state.lastSaved);
export const useHasUnsavedChanges = () => useChatStore(state => state.hasUnsavedChanges());