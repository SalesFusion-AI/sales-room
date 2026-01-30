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
  painPoints?: string[];
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

export interface QualificationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1 (relative importance)
  status: 'qualified' | 'unqualified' | 'unknown';
  confidence: number; // 0-1 (AI confidence in this assessment)
  evidence?: string[]; // Messages/responses that led to this assessment
}

export interface QualificationSchema {
  id: string;
  name: string;
  criteria: QualificationCriterion[];
  scoreThreshold: number; // Minimum score (0-100) to be "ready to connect"
  customFields?: {
    [key: string]: any;
  };
}

export interface QualificationStatus {
  schemaId: string;
  criteria: Record<string, QualificationCriterion>; // criterion id -> criterion
  score: number; // 0-100 weighted score
  readyToConnect: boolean;
  lastUpdated: Date;
  notes?: string;
  aiAssessment?: {
    summary: string;
    confidence: number;
    nextQuestions?: string[];
  };
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

// Availability and Handoff Types
export interface SalesRep {
  id: string;
  name: string;
  title: string;
  email: string;
  avatar?: string;
  slackUserId?: string;
  calendarUrl?: string; // Calendly/Cal.com link
  timezone: string;
  isActive: boolean;
}

export interface AvailabilityStatus {
  status: 'available' | 'busy' | 'offline';
  nextAvailable?: Date;
  currentMeeting?: {
    title: string;
    endTime: Date;
  };
  lastUpdated: Date;
}

export interface HandoffConfig {
  enableTalkNow: boolean;
  enableSlackNotifications: boolean;
  slackConfig?: {
    channel: string; // Channel ID or name
    mentionUsers?: string[]; // User IDs to ping
    webhookUrl?: string;
  };
  availabilitySources: ('calendar' | 'slack' | 'manual')[];
  defaultCalendarUrl?: string; // Fallback booking link
  scoreThresholdForHandoff: number; // 0-100
  businessHours?: {
    timezone: string;
    days: {
      monday: { start: string; end: string; enabled: boolean };
      tuesday: { start: string; end: string; enabled: boolean };
      wednesday: { start: string; end: string; enabled: boolean };
      thursday: { start: string; end: string; enabled: boolean };
      friday: { start: string; end: string; enabled: boolean };
      saturday: { start: string; end: string; enabled: boolean };
      sunday: { start: string; end: string; enabled: boolean };
    };
  };
}

export interface SlackNotification {
  lead: {
    name?: string;
    email?: string;
    company?: string;
    score: number;
  };
  conversation: {
    summary: string;
    keyPoints: string[];
    painPoints: string[];
    qualificationDetails: Record<string, any>;
  };
  urgency: 'low' | 'medium' | 'high';
  sessionUrl?: string;
}

export interface ChatState {
  conversation: Conversation;
  isTyping: boolean;
  isQualified: boolean;
  showConnectOption: boolean;
  availabilityStatus: AvailabilityStatus;
  assignedRep?: SalesRep;
  handoffConfig?: HandoffConfig;
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

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

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