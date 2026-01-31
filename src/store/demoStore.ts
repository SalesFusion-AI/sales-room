import { create } from 'zustand';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface QualificationData {
  budget: 'unknown' | 'low' | 'medium' | 'high';
  authority: 'unknown' | 'low' | 'medium' | 'high';
  need: 'unknown' | 'low' | 'medium' | 'high';
  timeline: 'unknown' | 'immediate' | 'this-quarter' | 'this-year' | 'future';
}

interface DemoStore {
  messages: Message[];
  isTyping: boolean;
  prospectName: string;
  companyName: string;
  email: string;
  qualification: QualificationData;
  isQualified: boolean;
  showConnectOption: boolean;
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setTyping: (typing: boolean) => void;
  setProspectInfo: (name: string, company: string, email?: string) => void;
  updateQualification: (updates: Partial<QualificationData>) => void;
  checkQualificationStatus: () => void;
}

// Hidden company intelligence - this would come from Pipeline Bot API
const getCompanyIntelligence = (company: string) => {
  const intelligence: Record<string, any> = {
    'techflow': {
      industry: 'Software Development',
      size: '250-500 employees',
      likely_budget: 'medium-high',
      pain_points: ['manual processes', 'team collaboration', 'scaling'],
      tech_stack: ['React', 'Node.js', 'AWS']
    },
    'acme': {
      industry: 'Manufacturing', 
      size: '1000+ employees',
      likely_budget: 'high',
      pain_points: ['supply chain', 'automation', 'efficiency'],
      tech_stack: ['SAP', 'Oracle', 'legacy systems']
    }
  };
  
  const key = company.toLowerCase().split(' ')[0];
  return intelligence[key] || null;
};

export const useDemoStore = create<DemoStore>((set, get) => ({
  messages: [
    {
      id: '1',
      content: 'Hi there! I\'m here to help you discover how our sales automation platform can boost your team\'s productivity. What\'s your name?',
      role: 'assistant',
      timestamp: new Date(),
    }
  ],
  isTyping: false,
  prospectName: '',
  companyName: '',
  email: '',
  qualification: {
    budget: 'unknown',
    authority: 'unknown', 
    need: 'unknown',
    timeline: 'unknown'
  },
  isQualified: false,
  showConnectOption: false,
  
  addMessage: (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    };
    
    set(state => ({
      messages: [...state.messages, newMessage]
    }));
    
    // AI response with hidden intelligence
    if (role === 'user') {
      setTimeout(() => {
        set({ isTyping: true });
        
        setTimeout(() => {
          let aiResponse = '';
          const userMessage = content.toLowerCase();
          const state = get();
          
          // Extract info naturally from conversation
          if (!state.prospectName && (userMessage.includes('i\'m ') || userMessage.includes('my name'))) {
            const name = content.split(/i'm |my name is |i am /i)[1]?.split(/[.!,]/)[0] || '';
            if (name) {
              get().setProspectInfo(name, state.companyName);
              aiResponse = `Nice to meet you, ${name}! What company do you work for?`;
            }
          } else if (!state.companyName && (userMessage.includes('work at') || userMessage.includes('company') || userMessage.includes('i work for'))) {
            const company = content.match(/(?:work at|work for|company is|at) ([^.!,\n]+)/i)?.[1] || '';
            if (company) {
              get().setProspectInfo(state.prospectName, company);
              
              // Use hidden intelligence to craft smart response
              const intel = getCompanyIntelligence(company);
              if (intel) {
                aiResponse = `${company} - that's exciting! I know ${intel.industry} companies like yours often struggle with ${intel.pain_points[0]} and ${intel.pain_points[1]}. What's your biggest challenge with your current sales process?`;
                get().updateQualification({ need: 'medium' });
              } else {
                aiResponse = `${company} sounds great! What industry are you in, and what challenges are you facing with your sales process?`;
              }
            }
          } else if (userMessage.includes('budget') || userMessage.includes('cost') || userMessage.includes('price')) {
            aiResponse = `Great question! Our platform typically pays for itself within 2-3 months through increased productivity. Most teams see 3x more qualified leads. What size is your sales team?`;
            get().updateQualification({ budget: 'medium' });
          } else if (userMessage.includes('manager') || userMessage.includes('director') || userMessage.includes('vp') || userMessage.includes('ceo')) {
            aiResponse = `Perfect! As a decision-maker, you\'ll appreciate how our platform reduces your team\'s manual work by 70%. What\'s driving you to look at sales automation right now?`;
            get().updateQualification({ authority: 'high' });
          } else if (userMessage.includes('urgent') || userMessage.includes('asap') || userMessage.includes('immediately') || userMessage.includes('this month')) {
            aiResponse = `I love the urgency! We can have you up and running within 24 hours. What\'s the immediate pain point you need to solve?`;
            get().updateQualification({ timeline: 'immediate' });
          } else if (userMessage.includes('manual') || userMessage.includes('time consuming') || userMessage.includes('inefficient')) {
            aiResponse = `That\'s exactly what we solve! Our AI handles lead qualification automatically, so your reps focus only on high-value prospects. Would you like to see how it works?`;
            get().updateQualification({ need: 'high' });
          } else if (userMessage.includes('demo') || userMessage.includes('see it') || userMessage.includes('show me')) {
            aiResponse = `I\'d love to show you a personalized demo! Based on what you\'ve shared, I think you\'d be a great fit. Should I connect you with one of our solution specialists for a 15-minute demo tailored to ${state.companyName || 'your company'}?`;
          } else if (userMessage.includes('yes') || userMessage.includes('connect') || userMessage.includes('talk to')) {
            aiResponse = `Excellent! I\'ll connect you with Sarah, our senior sales consultant. She specializes in helping ${state.companyName ? `companies like ${state.companyName}` : 'sales teams'} implement automation. What\'s the best email to send the meeting invite to?`;
            set({ showConnectOption: true });
          } else {
            // Default intelligent response
            const responses = [
              `That\'s really interesting! Can you tell me more about your role and what you\'re hoping to achieve?`,
              `I see! Many of our clients mentioned similar challenges before switching to our platform. What\'s your current process like?`,
              `That makes sense. What would success look like for your sales team?`
            ];
            aiResponse = responses[Math.floor(Math.random() * responses.length)];
          }
          
          get().addMessage(aiResponse, 'assistant');
          set({ isTyping: false });
          get().checkQualificationStatus();
        }, 1500);
      }, 500);
    }
  },
  
  setTyping: (typing: boolean) => set({ isTyping: typing }),
  
  setProspectInfo: (name: string, company: string, email?: string) => 
    set({ 
      prospectName: name, 
      companyName: company,
      ...(email && { email })
    }),
  
  updateQualification: (updates: Partial<QualificationData>) => 
    set(state => ({
      qualification: { ...state.qualification, ...updates }
    })),
  
  checkQualificationStatus: () => {
    const { qualification } = get();
    const scores = Object.values(qualification);
    const qualifiedCount = scores.filter(score => score !== 'unknown').length;
    const highScores = scores.filter(score => ['high', 'immediate', 'this-quarter'].includes(score)).length;
    
    const isQualified = qualifiedCount >= 3 || highScores >= 2;
    set({ isQualified });
  },
}));

// Selector hooks
export const useMessages = () => useDemoStore(state => state.messages);
export const useIsTyping = () => useDemoStore(state => state.isTyping);
export const useProspectInfo = () => useDemoStore(state => ({ 
  name: state.prospectName, 
  company: state.companyName,
  email: state.email
}));
export const useQualificationStatus = () => useDemoStore(state => ({
  isQualified: state.isQualified,
  showConnect: state.showConnectOption,
  qualification: state.qualification
}));