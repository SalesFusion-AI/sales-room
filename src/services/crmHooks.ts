import type { StoredConversation, TranscriptSummary } from '../types';
import { slackService, type SlackNotificationData } from './slackService';

export interface CRMLeadData {
  // Standard fields
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  title?: string;
  phone?: string;
  
  // Qualification data
  qualificationScore: number;
  leadSource: string;
  leadStatus: 'New' | 'Qualified' | 'Hot' | 'Warm' | 'Cold';
  
  // Custom fields
  painPoints?: string[];
  budget?: string;
  timeline?: string;
  authority?: string;
  conversationSummary?: string;
  
  // Metadata
  sessionId: string;
  conversationUrl?: string;
  lastActivity: Date;
  messageCount: number;
}

export interface CRMProvider {
  name: 'HubSpot' | 'Salesforce' | 'Pipedrive' | 'Custom';
  createLead(data: CRMLeadData): Promise<{ success: boolean; leadId?: string; error?: string }>;
  updateLead(leadId: string, data: Partial<CRMLeadData>): Promise<{ success: boolean; error?: string }>;
  addNote(leadId: string, note: string, type?: 'Conversation' | 'Qualification' | 'System'): Promise<{ success: boolean; error?: string }>;
}

/**
 * Base CRM integration class
 */
abstract class BaseCRMProvider implements CRMProvider {
  abstract name: 'HubSpot' | 'Salesforce' | 'Pipedrive' | 'Custom';
  
  abstract createLead(data: CRMLeadData): Promise<{ success: boolean; leadId?: string; error?: string }>;
  abstract updateLead(leadId: string, data: Partial<CRMLeadData>): Promise<{ success: boolean; error?: string }>;
  abstract addNote(leadId: string, note: string, type?: 'Conversation' | 'Qualification' | 'System'): Promise<{ success: boolean; error?: string }>;

  /**
   * Convert conversation to CRM lead data
   */
  protected conversationToCRMData(conversation: StoredConversation, summary?: TranscriptSummary): CRMLeadData {
    const name = conversation.prospect.name?.split(' ') || [];
    const firstName = name[0] || '';
    const lastName = name.slice(1).join(' ') || '';
    
    const leadStatus = this.getLeadStatus(conversation.qualificationStatus.score);
    
    return {
      firstName,
      lastName,
      email: conversation.prospect.email || undefined,
      company: conversation.prospect.company || undefined,
      title: conversation.prospect.title || undefined,
      qualificationScore: conversation.qualificationStatus.score,
      leadSource: 'SalesFusion Sales Room',
      leadStatus,
      painPoints: summary?.painPoints || [],
      conversationSummary: summary?.keyPoints.join('\n') || undefined,
      sessionId: conversation.sessionId,
      lastActivity: conversation.lastActivity,
      messageCount: conversation.messages.length,
    };
  }

  /**
   * Determine lead status based on qualification score
   */
  protected getLeadStatus(score: number): 'New' | 'Qualified' | 'Hot' | 'Warm' | 'Cold' {
    if (score >= 85) return 'Hot';
    if (score >= 60) return 'Warm';
    if (score >= 40) return 'Qualified';
    return 'Cold';
  }
}

/**
 * HubSpot CRM Provider
 */
class HubSpotProvider extends BaseCRMProvider {
  name: 'HubSpot' = 'HubSpot';

  async createLead(data: CRMLeadData): Promise<{ success: boolean; leadId?: string; error?: string }> {
    // TODO: Implement HubSpot API integration
    console.log('🏗️  HubSpot integration not yet implemented');
    console.log('Would create lead:', data);
    
    return {
      success: false,
      error: 'HubSpot integration not yet implemented'
    };
  }

  async updateLead(leadId: string, data: Partial<CRMLeadData>): Promise<{ success: boolean; error?: string }> {
    console.log('🏗️  Would update HubSpot lead:', leadId, data);
    return { success: false, error: 'Not implemented' };
  }

  async addNote(leadId: string, note: string, type?: string): Promise<{ success: boolean; error?: string }> {
    console.log('🏗️  Would add HubSpot note:', leadId, type, note);
    return { success: false, error: 'Not implemented' };
  }
}

/**
 * Salesforce CRM Provider  
 */
class SalesforceProvider extends BaseCRMProvider {
  name: 'Salesforce' = 'Salesforce';

  async createLead(data: CRMLeadData): Promise<{ success: boolean; leadId?: string; error?: string }> {
    // TODO: Implement Salesforce API integration
    console.log('🏗️  Salesforce integration not yet implemented');
    console.log('Would create lead:', data);
    
    return {
      success: false,
      error: 'Salesforce integration not yet implemented'
    };
  }

  async updateLead(leadId: string, data: Partial<CRMLeadData>): Promise<{ success: boolean; error?: string }> {
    console.log('🏗️  Would update Salesforce lead:', leadId, data);
    return { success: false, error: 'Not implemented' };
  }

  async addNote(leadId: string, note: string, type?: string): Promise<{ success: boolean; error?: string }> {
    console.log('🏗️  Would add Salesforce note:', leadId, type, note);
    return { success: false, error: 'Not implemented' };
  }
}

/**
 * Mock CRM Provider for testing
 */
class MockCRMProvider extends BaseCRMProvider {
  name: 'Custom' = 'Custom';
  private leads = new Map<string, CRMLeadData>();

  async createLead(data: CRMLeadData): Promise<{ success: boolean; leadId?: string; error?: string }> {
    const leadId = `mock_lead_${Date.now()}`;
    this.leads.set(leadId, data);
    
    console.log('✅ Mock CRM: Created lead', leadId, data);
    
    return { success: true, leadId };
  }

  async updateLead(leadId: string, data: Partial<CRMLeadData>): Promise<{ success: boolean; error?: string }> {
    const existing = this.leads.get(leadId);
    if (!existing) {
      return { success: false, error: 'Lead not found' };
    }

    this.leads.set(leadId, { ...existing, ...data });
    console.log('✅ Mock CRM: Updated lead', leadId, data);
    
    return { success: true };
  }

  async addNote(leadId: string, note: string, type = 'System'): Promise<{ success: boolean; error?: string }> {
    console.log('✅ Mock CRM: Added note to lead', leadId, `[${type}] ${note}`);
    return { success: true };
  }

  // Debug method
  getLead(leadId: string): CRMLeadData | undefined {
    return this.leads.get(leadId);
  }

  getAllLeads(): [string, CRMLeadData][] {
    return Array.from(this.leads.entries());
  }
}

/**
 * CRM Hooks Service - Manages CRM integrations and notifications
 */
class CRMHooksService {
  private provider: CRMProvider;

  constructor() {
    // Determine which CRM provider to use based on environment
    const crmType = process.env.VITE_CRM_PROVIDER?.toLowerCase();
    
    switch (crmType) {
      case 'hubspot':
        this.provider = new HubSpotProvider();
        break;
      case 'salesforce':
        this.provider = new SalesforceProvider();
        break;
      default:
        this.provider = new MockCRMProvider();
    }

    console.log(`🔗 CRM Hooks initialized with provider: ${this.provider.name}`);
  }

  /**
   * Handle qualification score update - send notifications and sync to CRM
   */
  async handleQualificationUpdate(
    conversation: StoredConversation,
    previousScore?: number,
    summary?: TranscriptSummary
  ): Promise<void> {
    try {
      // Send Slack notification
      const slackData: SlackNotificationData = {
        prospectName: conversation.prospect.name || 'Anonymous',
        company: conversation.prospect.company,
        email: conversation.prospect.email,
        score: conversation.qualificationStatus.score,
        previousScore,
        qualifiedFields: this.getQualifiedFields(conversation),
        sessionId: conversation.sessionId,
        timestamp: new Date(),
      };

      await slackService.sendQualificationUpdate(slackData);

      // Auto-sync high-value leads to CRM
      if (conversation.qualificationStatus.score >= 75 && !conversation.crmId) {
        await this.syncToCRM(conversation, summary);
      }
    } catch (error) {
      console.error('❌ Failed to handle qualification update:', error);
    }
  }

  /**
   * Sync conversation to CRM
   */
  async syncToCRM(conversation: StoredConversation, summary?: TranscriptSummary): Promise<string | null> {
    try {
      const leadData = (this.provider as any).conversationToCRMData(conversation, summary);
      const result = await this.provider.createLead(leadData);
      
      if (result.success && result.leadId) {
        console.log(`✅ Synced to ${this.provider.name}:`, result.leadId);
        
        // Add conversation transcript as note
        if (summary) {
          const noteContent = this.formatConversationNote(conversation, summary);
          await this.provider.addNote(result.leadId, noteContent, 'Conversation');
        }
        
        return result.leadId;
      } else {
        console.error(`❌ Failed to sync to ${this.provider.name}:`, result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ CRM sync error:', error);
      return null;
    }
  }

  /**
   * Add follow-up note to existing CRM lead
   */
  async addFollowUpNote(leadId: string, note: string): Promise<boolean> {
    try {
      const result = await this.provider.addNote(leadId, note, 'Qualification');
      return result.success;
    } catch (error) {
      console.error('❌ Failed to add follow-up note:', error);
      return false;
    }
  }

  /**
   * Get currently active CRM provider name
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Helper: Extract qualified fields from conversation
   */
  private getQualifiedFields(conversation: StoredConversation): string[] {
    const fields: string[] = [];
    const status = conversation.qualificationStatus;
    
    Object.values(status.criteria || {}).forEach(criterion => {
      if (criterion.status === 'qualified') {
        fields.push(criterion.name);
      }
    });
    
    return fields;
  }

  /**
   * Helper: Format conversation for CRM note
   */
  private formatConversationNote(conversation: StoredConversation, summary: TranscriptSummary): string {
    let note = `Sales Room Conversation Summary\n`;
    note += `Session: ${conversation.sessionId}\n`;
    note += `Date: ${conversation.createdAt.toLocaleDateString()}\n`;
    note += `Messages: ${conversation.messages.length}\n`;
    note += `Qualification Score: ${conversation.qualificationStatus.score}%\n\n`;
    
    if (summary.keyPoints.length > 0) {
      note += `Key Points:\n${summary.keyPoints.map(p => `• ${p}`).join('\n')}\n\n`;
    }
    
    if (summary.painPoints.length > 0) {
      note += `Pain Points:\n${summary.painPoints.map(p => `• ${p}`).join('\n')}\n\n`;
    }
    
    if (summary.concerns.length > 0) {
      note += `Concerns:\n${summary.concerns.map(c => `• ${c}`).join('\n')}\n\n`;
    }
    
    if (summary.nextSteps.length > 0) {
      note += `Recommended Next Steps:\n${summary.nextSteps.map(s => `• ${s}`).join('\n')}\n`;
    }
    
    return note;
  }
}

export const crmHooksService = new CRMHooksService();