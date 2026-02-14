import type { 
  StoredConversation, 
  TranscriptSummary
} from '../types';

export interface CRMConfig {
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
  fieldMapping?: CRMFieldMapping;
  autoSync: boolean;
  syncTriggers: ('new_lead' | 'qualified' | 'handoff')[];
}

export interface CRMFieldMapping {
  // Lead fields
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  industry?: string;
  leadSource?: string;
  leadStatus?: string;
  leadScore?: string;
  
  // Custom fields
  qualificationScore?: string;
  painPoints?: string;
  timeline?: string;
  budget?: string;
  tags?: string;
  
  // Notes/Activity fields
  notes?: string;
  transcript?: string;
  summary?: string;
}

export interface CRMLeadData {
  // Standard fields
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  industry?: string;
  
  // Lead qualification
  leadSource: string;
  leadStatus: string;
  leadScore: number;
  qualificationScore: number;
  
  // SalesFusion specific
  sessionId: string;
  tags: string[];
  painPoints: string[];
  timeline?: string;
  budget?: string;
  
  // Conversation data
  transcript: string;
  summary: string;
  messageCount: number;
  conversationDuration: number;
  
  // Metadata
  createdAt: Date;
  lastActivity: Date;
}

export interface CRMSyncResult {
  success: boolean;
  crmId?: string;
  error?: string;
  provider: string;
  syncedAt: Date;
}

// Default CRM configurations for popular providers
export const CRM_CONFIGS: Record<string, Partial<CRMConfig>> = {
  salesforce: {
    provider: 'salesforce',
    baseUrl: 'https://api.salesforce.com/services/data/v58.0',
    fieldMapping: {
      firstName: 'FirstName',
      lastName: 'LastName', 
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      title: 'Title',
      industry: 'Industry',
      leadSource: 'LeadSource',
      leadStatus: 'Status',
      leadScore: 'Rating',
      qualificationScore: 'Qualification_Score__c',
      painPoints: 'Pain_Points__c',
      timeline: 'Timeline__c',
      budget: 'Budget__c',
      tags: 'Tags__c',
      transcript: 'Conversation_Transcript__c',
      summary: 'AI_Summary__c',
      notes: 'Description'
    }
  },
  hubspot: {
    provider: 'hubspot',
    baseUrl: 'https://api.hubapi.com/crm/v3',
    fieldMapping: {
      firstName: 'firstname',
      lastName: 'lastname',
      email: 'email',
      phone: 'phone',
      company: 'company',
      title: 'jobtitle',
      industry: 'industry',
      leadSource: 'hs_lead_source',
      leadStatus: 'hs_lead_status',
      leadScore: 'hubspotscore',
      qualificationScore: 'qualification_score',
      painPoints: 'pain_points',
      timeline: 'timeline',
      budget: 'budget',
      tags: 'hs_lead_tags',
      transcript: 'conversation_transcript',
      summary: 'ai_summary',
      notes: 'hs_lead_notes'
    }
  },
  pipedrive: {
    provider: 'pipedrive',
    baseUrl: 'https://api.pipedrive.com/v1',
    fieldMapping: {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      company: 'org_name',
      title: 'job_title',
      leadSource: 'source',
      leadStatus: 'status',
      qualificationScore: 'qualification_score',
      painPoints: 'pain_points',
      timeline: 'timeline',
      budget: 'budget',
      tags: 'tags',
      transcript: 'transcript',
      summary: 'summary',
      notes: 'notes'
    }
  }
};

export class CRMService {
  private config: CRMConfig;

  constructor(config: CRMConfig) {
    this.config = config;
  }

  // Sync conversation to CRM
  async syncConversation(
    conversation: StoredConversation, 
    summary?: TranscriptSummary
  ): Promise<CRMSyncResult> {
    try {
      // Convert conversation to CRM format
      const leadData = this.convertToCRMFormat(conversation, summary);
      
      // Sync based on provider
      let result: CRMSyncResult;
      
      switch (this.config.provider) {
        case 'salesforce':
          result = await this.syncToSalesforce(leadData);
          break;
        case 'hubspot':
          result = await this.syncToHubspot(leadData);
          break;
        case 'pipedrive':
          result = await this.syncToPipedrive(leadData);
          break;
        case 'custom':
          result = await this.syncToCustomCRM(leadData);
          break;
        default:
          throw new Error(`Unsupported CRM provider: ${this.config.provider}`);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.config.provider,
        syncedAt: new Date()
      };
    }
  }

  // Convert conversation to CRM lead format
  private convertToCRMFormat(
    conversation: StoredConversation, 
    summary?: TranscriptSummary
  ): CRMLeadData {
    const prospect = conversation.prospect;
    const name = prospect.name ? this.parseName(prospect.name) : { firstName: '', lastName: '' };
    
    return {
      // Contact info
      firstName: name.firstName,
      lastName: name.lastName,
      email: prospect.email || '',
      phone: prospect.phone || '',
      company: prospect.company || '',
      title: prospect.title || '',
      industry: prospect.industry || '',
      
      // Lead data
      leadSource: 'SalesFusion Sales Room',
      leadStatus: this.determineLeadStatus(conversation.qualificationStatus.score),
      leadScore: Math.round(conversation.qualificationStatus.score),
      qualificationScore: conversation.qualificationStatus.score,
      
      // SalesFusion data
      sessionId: conversation.sessionId,
      tags: conversation.tags.map(tag => tag.name),
      painPoints: prospect.painPoints || [],
      timeline: prospect.timeline,
      budget: prospect.budget,
      
      // Conversation data
      transcript: this.formatTranscript(conversation.messages),
      summary: summary ? this.formatSummary(summary) : 'No summary available',
      messageCount: conversation.messages.length,
      conversationDuration: this.calculateDuration(conversation.messages),
      
      // Metadata
      createdAt: conversation.createdAt,
      lastActivity: conversation.lastActivity
    };
  }

  // Parse full name into first/last
  private parseName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  }

  // Determine lead status based on qualification score
  private determineLeadStatus(score: number): string {
    if (score >= 85) return 'Hot';
    if (score >= 60) return 'Warm'; 
    if (score >= 30) return 'Cold';
    return 'Unqualified';
  }

  // Format conversation transcript
  private formatTranscript(messages: Array<{ timestamp: Date; role: string; content: string }>): string {
    return messages
      .map(msg => `[${msg.timestamp.toLocaleTimeString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
  }

  // Format AI summary
  private formatSummary(summary: TranscriptSummary): string {
    const sections = [
      `QUALIFICATION SCORE: ${summary.qualificationSummary.score}%`,
      '',
      'KEY POINTS:',
      ...summary.keyPoints.map(point => `• ${point}`),
      '',
    ];

    if (summary.concerns.length > 0) {
      sections.push(
        'CONCERNS:',
        ...summary.concerns.map(concern => `• ${concern}`),
        ''
      );
    }

    if (summary.painPoints.length > 0) {
      sections.push(
        'PAIN POINTS:',
        ...summary.painPoints.map(point => `• ${point}`),
        ''
      );
    }

    sections.push(
      'NEXT STEPS:',
      ...summary.nextSteps.map(step => `• ${step}`)
    );

    return sections.join('\n');
  }

  // Calculate conversation duration
  private calculateDuration(messages: Array<{ timestamp: Date }>): number {
    if (messages.length < 2) return 0;
    const start = messages[0].timestamp.getTime();
    const end = messages[messages.length - 1].timestamp.getTime();
    return Math.round((end - start) / (1000 * 60)); // minutes
  }

  // Sync to Salesforce
  private async syncToSalesforce(leadData: CRMLeadData): Promise<CRMSyncResult> {
    if (!this.config.apiKey) {
      throw new Error('Salesforce API key not configured');
    }

    // Map to Salesforce fields (would be used in real implementation)
    const mapping = this.config.fieldMapping || CRM_CONFIGS.salesforce.fieldMapping!;
    this.mapFields(leadData, mapping);

    // Mock Salesforce API call
    const response = await this.mockSalesforceAPI();
    
    return {
      success: true,
      crmId: response.id,
      provider: 'salesforce',
      syncedAt: new Date()
    };
  }

  // Sync to HubSpot
  private async syncToHubspot(leadData: CRMLeadData): Promise<CRMSyncResult> {
    if (!this.config.apiKey) {
      throw new Error('HubSpot API key not configured');
    }

    // Map to HubSpot fields (would be used in real implementation)
    const mapping = this.config.fieldMapping || CRM_CONFIGS.hubspot.fieldMapping!;
    this.mapFields(leadData, mapping);

    // Mock HubSpot API call
    const response = await this.mockHubspotAPI();
    
    return {
      success: true,
      crmId: response.id,
      provider: 'hubspot',
      syncedAt: new Date()
    };
  }

  // Sync to Pipedrive
  private async syncToPipedrive(leadData: CRMLeadData): Promise<CRMSyncResult> {
    if (!this.config.apiKey) {
      throw new Error('Pipedrive API key not configured');
    }

    // Map to Pipedrive fields (would be used in real implementation)
    const mapping = this.config.fieldMapping || CRM_CONFIGS.pipedrive.fieldMapping!;
    this.mapFields(leadData, mapping);

    // Mock Pipedrive API call
    const response = await this.mockPipedriveAPI();
    
    return {
      success: true,
      crmId: response.id,
      provider: 'pipedrive',
      syncedAt: new Date()
    };
  }

  // Sync to custom CRM
  private async syncToCustomCRM(leadData: CRMLeadData): Promise<CRMSyncResult> {
    if (!this.config.baseUrl) {
      throw new Error('Custom CRM base URL not configured');
    }

    // Map fields if custom mapping provided
    const finalData = this.config.fieldMapping 
      ? this.mapFields(leadData, this.config.fieldMapping)
      : leadData;

    // Custom CRM API call
    const response = await fetch(`${this.config.baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.customHeaders
      },
      body: JSON.stringify(finalData)
    });

    if (!response.ok) {
      throw new Error(`Custom CRM sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      crmId: result.id,
      provider: 'custom',
      syncedAt: new Date()
    };
  }

  // Map lead data fields according to CRM field mapping
  private mapFields(data: CRMLeadData, mapping: CRMFieldMapping): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};
    
    // Map standard fields
    Object.entries(mapping).forEach(([sourceField, targetField]) => {
      if (targetField && sourceField in data) {
        const value = data[sourceField as keyof CRMLeadData];
        if (value !== undefined && value !== null && value !== '') {
          // Handle arrays (tags, pain points)
          if (Array.isArray(value)) {
            mapped[targetField] = value.join('; ');
          } else {
            mapped[targetField] = value;
          }
        }
      }
    });

    return mapped;
  }

  // Mock API implementations (replace with real ones)
  private async mockSalesforceAPI(): Promise<{ id: string }> {
    await this.delay(200);
    return { id: `SF_${Date.now()}` };
  }

  private async mockHubspotAPI(): Promise<{ id: string }> {
    await this.delay(150);
    return { id: `HS_${Date.now()}` };
  }

  private async mockPipedriveAPI(): Promise<{ id: string }> {
    await this.delay(100);
    return { id: `PD_${Date.now()}` };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if should auto-sync based on triggers
  shouldAutoSync(conversation: StoredConversation, trigger: 'new_lead' | 'qualified' | 'handoff'): boolean {
    if (!this.config.autoSync) return false;
    return this.config.syncTriggers.includes(trigger);
  }

  // Batch sync multiple conversations
  async batchSync(conversations: StoredConversation[]): Promise<CRMSyncResult[]> {
    const results: CRMSyncResult[] = [];
    
    for (const conversation of conversations) {
      try {
        const result = await this.syncConversation(conversation);
        results.push(result);
        
        // Add delay between requests to avoid rate limiting
        await this.delay(100);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: this.config.provider,
          syncedAt: new Date()
        });
      }
    }
    
    return results;
  }

  // Update configuration
  updateConfig(newConfig: Partial<CRMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Test CRM connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test with minimal data
      const testData: CRMLeadData = {
        firstName: 'Test',
        lastName: 'Lead',
        email: 'test@salesfusion.ai',
        company: 'Test Company',
        leadSource: 'SalesFusion Test',
        leadStatus: 'Test',
        leadScore: 0,
        qualificationScore: 0,
        sessionId: 'test-session',
        tags: ['test'],
        painPoints: [],
        transcript: 'Test transcript',
        summary: 'Test summary',
        messageCount: 1,
        conversationDuration: 1,
        createdAt: new Date(),
        lastActivity: new Date()
      };

      await this.syncConversation({
        ...testData,
        // Add required StoredConversation fields for testing
        id: 'test',
        messages: [],
        prospect: {
          id: 'test',
          name: 'Test Lead'
        },
        qualificationStatus: {
          schemaId: 'test',
          criteria: {},
          score: 0,
          readyToConnect: false,
          lastUpdated: new Date()
        },
        tags: [],
        crmSynced: false,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        sessionId: 'test-session',
        summary: undefined
      } as StoredConversation);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Default CRM service instance (can be configured)
export const crmService = new CRMService({
  provider: 'custom',
  autoSync: true,
  syncTriggers: ['qualified', 'handoff'],
  baseUrl: process.env.REACT_APP_CRM_BASE_URL || 'http://localhost:3001/api/crm',
  customHeaders: {
    'Authorization': `Bearer ${process.env.REACT_APP_CRM_API_KEY || 'demo-key'}`
  }
});