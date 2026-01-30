// Core Types for Sales Room

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    type?: 'question' | 'objection' | 'qualification' | 'general';
    confidence?: number;
    sources?: string[];
    suggestedActions?: string[];
  };
}

export interface Conversation {
  id: string;
  sessionId: string;
  messages: Message[];
  prospect: ProspectInfo;
  qualificationStatus: QualificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProspectInfo {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  companyUrl?: string;
  title?: string;
  phone?: string;
  industry?: string;
  companySize?: string;
  pain points?: string[];
  budget?: string;
  timeline?: string;
  decisionMaker?: boolean;
  enrichmentData?: CompanyEnrichmentData;
}

export interface CompanyEnrichmentData {
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  employeeCount?: number;
  revenue?: string;
  founded?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  description?: string;
  technologies?: string[];
  recentNews?: Array<{
    title: string;
    url: string;
    date: string;
  }>;
}

export interface QualificationStatus {
  budget: 'qualified' | 'unqualified' | 'unknown';
  authority: 'qualified' | 'unqualified' | 'unknown';
  need: 'qualified' | 'unqualified' | 'unknown';
  timeline: 'qualified' | 'unqualified' | 'unknown';
  score: number; // 0-100
  readyToConnect: boolean;
  notes?: string;
}

export interface KnowledgeBase {
  id: string;
  clientId: string;
  sections: KnowledgeSection[];
  faqs: FAQ[];
  pricing: PricingInfo[];
  objections: ObjectionHandler[];
  companyInfo: CompanyInfo;
  updatedAt: Date;
}

export interface KnowledgeSection {
  id: string;
  title: string;
  content: string;
  category: 'product' | 'service' | 'pricing' | 'process' | 'company' | 'support';
  tags: string[];
  priority: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  popularity: number;
}

export interface PricingInfo {
  id: string;
  planName: string;
  price: string;
  interval: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  description?: string;
  popular?: boolean;
  customPricing?: boolean;
}

export interface ObjectionHandler {
  id: string;
  objection: string;
  category: 'price' | 'timing' | 'authority' | 'need' | 'competition' | 'trust' | 'other';
  response: string;
  followUpQuestions?: string[];
  keywords: string[];
}

export interface CompanyInfo {
  name: string;
  description: string;
  website: string;
  industry: string;
  founded?: number;
  size?: string;
  values?: string[];
  differentiators?: string[];
}

export interface BrandConfig {
  id: string;
  clientId: string;
  branding: {
    logoUrl?: string;
    favicon?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    customCss?: string;
  };
  messaging: {
    welcomeMessage: string;
    companyCta: string;
    qualificationCta: string;
    connectCta: string;
    offlineMessage?: string;
  };
  features: {
    showCompanyEnrichment: boolean;
    requireQualification: boolean;
    allowDirectConnect: boolean;
    captureEmail: boolean;
    showPricing: boolean;
  };
}

export interface GuidedPrompt {
  id: string;
  text: string;
  category: 'intro' | 'product' | 'pricing' | 'process' | 'objection';
  context?: string;
  followUp?: string[];
  priority: number;
}

export interface ChatState {
  conversation: Conversation;
  isTyping: boolean;
  isQualified: boolean;
  showConnectOption: boolean;
  availabilityStatus: 'online' | 'offline' | 'busy';
  repInfo?: {
    name: string;
    title: string;
    avatar?: string;
  };
}

export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
  suggestedPrompts?: string[];
  qualificationUpdate?: Partial<QualificationStatus>;
  shouldConnect?: boolean;
  objectionDetected?: {
    type: string;
    confidence: number;
  };
}

// Event types for tracking
export interface AnalyticsEvent {
  type: 'message_sent' | 'objection_raised' | 'qualification_updated' | 'connect_requested' | 'company_enriched';
  sessionId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface SalesRoomConfig {
  apiBaseUrl: string;
  aiModel: string;
  aiApiKey?: string;
  features: {
    enableEnrichment: boolean;
    enableQualification: boolean;
    enableConnectNow: boolean;
    enablePricingDisplay: boolean;
  };
  rateLimit: {
    messagesPerMinute: number;
    maxMessageLength: number;
  };
}

export type MessageType = 'text' | 'rich' | 'options' | 'form' | 'pricing' | 'connect';

export interface RichMessage extends Message {
  type: MessageType;
  data?: {
    options?: string[];
    form?: FormField[];
    pricing?: PricingInfo[];
    connectInfo?: {
      available: boolean;
      nextSlot?: Date;
      calendarUrl?: string;
    };
  };
}