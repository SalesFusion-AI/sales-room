import type { 
  Conversation, 
  QualificationStatus 
} from '../types';
import {
  DEFAULT_PII_TTL_MS,
  getExpiringSessionItem,
  isSessionStorageAvailable,
  setExpiringSessionItem,
} from '../utils/sessionStorage';

export interface TranscriptSummary {
  id: string;
  sessionId: string;
  generatedAt: Date;
  keyPoints: string[];
  concerns: string[];
  painPoints: string[];
  qualificationSummary: {
    score: number;
    criteria: Record<string, { status: string; evidence: string[] }>;
    readyToConnect: boolean;
  };
  nextSteps: string[];
  aiConfidence: number;
  wordCount: number;
  messageCount: number;
  duration: number; // in minutes
}

export interface LeadTag {
  id: string;
  name: string;
  color: string;
  description: string;
  autoAssignRule: {
    scoreMin?: number;
    scoreMax?: number;
    criteria?: string[];
    keywords?: string[];
  };
}

export interface StoredConversation extends Conversation {
  tags: LeadTag[];
  summary?: TranscriptSummary;
  crmSynced: boolean;
  crmId?: string;
  lastActivity: Date;
}

// Default lead tags
export const DEFAULT_LEAD_TAGS: LeadTag[] = [
  {
    id: 'hot',
    name: 'Hot Lead',
    color: '#ef4444', // red-500
    description: 'Highly qualified, ready to buy',
    autoAssignRule: {
      scoreMin: 85,
    }
  },
  {
    id: 'warm',
    name: 'Warm Lead', 
    color: '#f59e0b', // amber-500
    description: 'Qualified, needs nurturing',
    autoAssignRule: {
      scoreMin: 60,
      scoreMax: 84,
    }
  },
  {
    id: 'cold',
    name: 'Cold Lead',
    color: '#6b7280', // gray-500
    description: 'Early stage or unqualified',
    autoAssignRule: {
      scoreMax: 59,
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    color: '#7c3aed', // violet-600
    description: 'Large company prospect',
    autoAssignRule: {
      keywords: ['enterprise', 'corporation', 'fortune', '500+', '1000+', 'global']
    }
  },
  {
    id: 'urgent',
    name: 'Urgent',
    color: '#dc2626', // red-600
    description: 'Time-sensitive opportunity',
    autoAssignRule: {
      keywords: ['urgent', 'asap', 'immediately', 'deadline', 'this week', 'this month']
    }
  }
];

export class TranscriptService {
  private storageKey = 'salesfusion_transcripts';
  private summaryKey = 'salesfusion_summaries';
  private isSessionStorageAvailable = true;
  private inMemoryTranscripts: StoredConversation[] = [];
  private inMemorySummaries: TranscriptSummary[] = [];
  private retentionMs = DEFAULT_PII_TTL_MS;
  
  constructor() {
    // Check if sessionStorage is available
    this.isSessionStorageAvailable = isSessionStorageAvailable();
    this.cleanupExpiredStorage();
  }

  private cleanupExpiredStorage(): void {
    if (!this.isSessionStorageAvailable) return;
    // Trigger expiry checks for known keys
    getExpiringSessionItem<StoredConversation[]>(this.storageKey);
    getExpiringSessionItem<TranscriptSummary[]>(this.summaryKey);
  }
  
  // Store conversation transcript
  async storeConversation(conversation: Conversation): Promise<StoredConversation> {
    const storedConversation: StoredConversation = {
      ...conversation,
      tags: this.assignTags(conversation),
      crmSynced: false,
      lastActivity: new Date(),
    };

    // Get existing transcripts
    const transcripts = this.getStoredTranscripts();
    
    // Update or add conversation
    const existingIndex = transcripts.findIndex(t => t.sessionId === conversation.sessionId);
    if (existingIndex >= 0) {
      transcripts[existingIndex] = storedConversation;
    } else {
      transcripts.push(storedConversation);
    }

    // Try to store in sessionStorage with expiry, fallback to in-memory storage
    const success = this.isSessionStorageAvailable
      ? setExpiringSessionItem(this.storageKey, transcripts, this.retentionMs)
      : false;
    if (!success) {
      // Fallback to in-memory storage
      this.inMemoryTranscripts = transcripts;
      console.warn('Using in-memory storage for transcripts');
    }
    
    return storedConversation;
  }

  // Get stored transcripts
  getStoredTranscripts(): StoredConversation[] {
    try {
      const stored = this.isSessionStorageAvailable
        ? getExpiringSessionItem<StoredConversation[]>(this.storageKey)
        : null;
      if (!stored) {
        // Return in-memory storage if sessionStorage is unavailable
        return this.isSessionStorageAvailable ? [] : this.inMemoryTranscripts;
      }
      
      const transcripts = stored as StoredConversation[];
      return transcripts.map((t: StoredConversation) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        lastActivity: new Date(t.lastActivity),
        messages: t.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Failed to load stored transcripts:', error);
      // Return in-memory storage as fallback
      return this.isSessionStorageAvailable ? [] : this.inMemoryTranscripts;
    }
  }

  // Get conversation by session ID
  getConversationBySessionId(sessionId: string): StoredConversation | null {
    const transcripts = this.getStoredTranscripts();
    return transcripts.find(t => t.sessionId === sessionId) || null;
  }

  // Get conversations for a prospect (by email)
  getConversationsByProspect(email: string): StoredConversation[] {
    const transcripts = this.getStoredTranscripts();
    return transcripts
      .filter(t => t.prospect.email === email)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  // Generate AI summary of conversation
  async generateSummary(conversation: Conversation): Promise<TranscriptSummary> {
    const messages = conversation.messages;
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    // Calculate conversation metrics
    const wordCount = conversationText.split(' ').length;
    const duration = messages.length > 1 
      ? Math.round((messages[messages.length - 1].timestamp.getTime() - messages[0].timestamp.getTime()) / (1000 * 60))
      : 0;

    // Extract key information (in production, this would use AI/NLP)
    const summary: TranscriptSummary = {
      id: `summary-${conversation.sessionId}`,
      sessionId: conversation.sessionId,
      generatedAt: new Date(),
      keyPoints: this.extractKeyPoints(conversation),
      concerns: this.extractConcerns(conversationText),
      painPoints: conversation.prospect.painPoints || [],
      qualificationSummary: {
        score: conversation.qualificationStatus.score,
        criteria: this.formatQualificationCriteria(conversation.qualificationStatus),
        readyToConnect: conversation.qualificationStatus.readyToConnect,
      },
      nextSteps: this.generateNextSteps(conversation),
      aiConfidence: this.calculateSummaryConfidence(conversation),
      wordCount,
      messageCount: messages.length,
      duration,
    };

    // Store summary
    this.storeSummary(summary);
    
    return summary;
  }

  // Store summary
  private storeSummary(summary: TranscriptSummary): void {
    const summaries = this.getStoredSummaries();
    const existingIndex = summaries.findIndex(s => s.sessionId === summary.sessionId);
    
    if (existingIndex >= 0) {
      summaries[existingIndex] = summary;
    } else {
      summaries.push(summary);
    }
    
    // Try to store in sessionStorage with expiry, fallback to in-memory storage
    const success = this.isSessionStorageAvailable
      ? setExpiringSessionItem(this.summaryKey, summaries, this.retentionMs)
      : false;
    if (!success) {
      // Fallback to in-memory storage
      this.inMemorySummaries = summaries;
      console.warn('Using in-memory storage for summaries');
    }
  }

  // Get stored summaries
  private getStoredSummaries(): TranscriptSummary[] {
    try {
      const stored = this.isSessionStorageAvailable
        ? getExpiringSessionItem<TranscriptSummary[]>(this.summaryKey)
        : null;
      if (!stored) {
        // Return in-memory storage if sessionStorage is unavailable
        return this.isSessionStorageAvailable ? [] : this.inMemorySummaries;
      }
      
      const summaries = stored as TranscriptSummary[];
      return summaries.map((s: TranscriptSummary) => ({
        ...s,
        generatedAt: new Date(s.generatedAt),
      }));
    } catch (error) {
      console.error('Failed to load stored summaries:', error);
      // Return in-memory storage as fallback
      return this.isSessionStorageAvailable ? [] : this.inMemorySummaries;
    }
  }

  // Get summary by session ID
  getSummary(sessionId: string): TranscriptSummary | null {
    const summaries = this.getStoredSummaries();
    return summaries.find(s => s.sessionId === sessionId) || null;
  }

  // Auto-assign tags based on conversation
  assignTags(conversation: Conversation): LeadTag[] {
    const tags: LeadTag[] = [];
    const score = conversation.qualificationStatus.score;
    const conversationText = conversation.messages
      .map(m => m.content.toLowerCase())
      .join(' ');

    // Score-based tagging
    for (const tag of DEFAULT_LEAD_TAGS) {
      const rule = tag.autoAssignRule;
      let shouldAssign = false;

      // Check score range
      if (rule.scoreMin !== undefined && score >= rule.scoreMin) {
        if (rule.scoreMax === undefined || score <= rule.scoreMax) {
          shouldAssign = true;
        }
      } else if (rule.scoreMax !== undefined && score <= rule.scoreMax) {
        shouldAssign = true;
      }

      // Check keywords
      if (rule.keywords && rule.keywords.some(keyword => 
        conversationText.includes(keyword.toLowerCase())
      )) {
        shouldAssign = true;
      }

      if (shouldAssign) {
        tags.push(tag);
      }
    }

    return tags;
  }

  // Extract key points from conversation
  private extractKeyPoints(conversation: Conversation): string[] {
    const points: string[] = [];
    const prospect = conversation.prospect;
    
    if (prospect.name) points.push(`Contact: ${prospect.name}`);
    if (prospect.company) points.push(`Company: ${prospect.company}`);
    if (prospect.title) points.push(`Role: ${prospect.title}`);
    if (prospect.industry) points.push(`Industry: ${prospect.industry}`);
    if (prospect.companySize) points.push(`Company Size: ${prospect.companySize}`);
    if (prospect.budget) points.push(`Budget: ${prospect.budget}`);
    if (prospect.timeline) points.push(`Timeline: ${prospect.timeline}`);
    
    // Add qualification insights
    const qualified = Object.values(conversation.qualificationStatus.criteria)
      .filter(c => c.status === 'qualified')
      .map(c => c.name);
    
    if (qualified.length > 0) {
      points.push(`Qualified: ${qualified.join(', ')}`);
    }

    return points;
  }

  // Extract concerns from conversation
  private extractConcerns(conversationText: string): string[] {
    const concerns: string[] = [];
    const concernKeywords = [
      'worried', 'concern', 'problem', 'issue', 'challenge', 
      'difficult', 'expensive', 'cost', 'budget', 'risk',
      'not sure', 'uncertain', 'doubt', 'hesitant'
    ];

    const sentences = conversationText.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (concernKeywords.some(keyword => lowerSentence.includes(keyword))) {
        const trimmed = sentence.trim();
        if (trimmed.length > 10 && trimmed.length < 200) {
          concerns.push(trimmed);
        }
      }
    }

    return concerns.slice(0, 5); // Top 5 concerns
  }

  // Format qualification criteria for summary
  private formatQualificationCriteria(status: QualificationStatus): Record<string, { status: string; evidence: string[] }> {
    const formatted: Record<string, { status: string; evidence: string[] }> = {};
    
    Object.entries(status.criteria).forEach(([key, criterion]) => {
      formatted[key] = {
        status: criterion.status,
        evidence: criterion.evidence || []
      };
    });

    return formatted;
  }

  // Generate next steps
  private generateNextSteps(conversation: Conversation): string[] {
    const steps: string[] = [];
    const score = conversation.qualificationStatus.score;
    const prospect = conversation.prospect;

    if (score >= 75) {
      steps.push('Schedule demo or discovery call');
      steps.push('Prepare personalized proposal');
    } else if (score >= 50) {
      steps.push('Continue qualification conversation');
      steps.push('Address any concerns or objections');
    } else {
      steps.push('Nurture lead with relevant content');
      steps.push('Follow up in 2-4 weeks');
    }

    // Add specific steps based on missing info
    if (!prospect.email) {
      steps.push('Capture contact information');
    }
    
    if (!prospect.budget) {
      steps.push('Understand budget requirements');
    }

    if (!prospect.timeline) {
      steps.push('Clarify implementation timeline');
    }

    return steps.slice(0, 4); // Top 4 next steps
  }

  // Calculate summary confidence
  private calculateSummaryConfidence(conversation: Conversation): number {
    const messageCount = conversation.messages.length;
    const qualificationScore = conversation.qualificationStatus.score;
    const hasContactInfo = conversation.prospect.email ? 1 : 0;
    
    // Base confidence on message count, qualification completion, and contact info
    let confidence = Math.min(messageCount * 0.05, 0.4); // Up to 40% from messages
    confidence += qualificationScore * 0.005; // Up to 50% from qualification
    confidence += hasContactInfo * 0.1; // 10% boost for contact info
    
    return Math.min(confidence, 1.0);
  }

  // Search transcripts
  searchTranscripts(query: string): StoredConversation[] {
    const transcripts = this.getStoredTranscripts();
    const lowerQuery = query.toLowerCase();
    
    return transcripts.filter(transcript => {
      // Search in prospect info
      const prospect = transcript.prospect;
      if (prospect.name?.toLowerCase().includes(lowerQuery)) return true;
      if (prospect.email?.toLowerCase().includes(lowerQuery)) return true;
      if (prospect.company?.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in messages
      const hasMatchingMessage = transcript.messages.some(message => 
        message.content.toLowerCase().includes(lowerQuery)
      );
      
      if (hasMatchingMessage) return true;
      
      // Search in tags
      const hasMatchingTag = transcript.tags.some(tag =>
        tag.name.toLowerCase().includes(lowerQuery)
      );
      
      return hasMatchingTag;
    });
  }

  // Get transcript analytics
  getAnalytics(): {
    totalConversations: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
    avgQualificationScore: number;
    avgMessageCount: number;
    crmSyncedCount: number;
    tagDistribution: Record<string, number>;
  } {
    const transcripts = this.getStoredTranscripts();
    
    if (transcripts.length === 0) {
      return {
        totalConversations: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        avgQualificationScore: 0,
        avgMessageCount: 0,
        crmSyncedCount: 0,
        tagDistribution: {}
      };
    }

    const hotLeads = transcripts.filter(t => t.tags.some(tag => tag.id === 'hot')).length;
    const warmLeads = transcripts.filter(t => t.tags.some(tag => tag.id === 'warm')).length;
    const coldLeads = transcripts.filter(t => t.tags.some(tag => tag.id === 'cold')).length;
    
    const avgScore = transcripts.reduce((sum, t) => sum + t.qualificationStatus.score, 0) / transcripts.length;
    const avgMessages = transcripts.reduce((sum, t) => sum + t.messages.length, 0) / transcripts.length;
    const crmSynced = transcripts.filter(t => t.crmSynced).length;
    
    // Tag distribution
    const tagDistribution: Record<string, number> = {};
    transcripts.forEach(transcript => {
      transcript.tags.forEach(tag => {
        tagDistribution[tag.name] = (tagDistribution[tag.name] || 0) + 1;
      });
    });

    return {
      totalConversations: transcripts.length,
      hotLeads,
      warmLeads,
      coldLeads,
      avgQualificationScore: Math.round(avgScore),
      avgMessageCount: Math.round(avgMessages),
      crmSyncedCount: crmSynced,
      tagDistribution
    };
  }
}

export const transcriptService = new TranscriptService();