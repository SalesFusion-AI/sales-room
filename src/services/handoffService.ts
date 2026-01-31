import type { 
  SalesRep, 
  AvailabilityStatus, 
  HandoffConfig, 
  SlackNotification, 
  Conversation 
} from '../types';

export class HandoffService {
  private config: HandoffConfig;
  private reps: SalesRep[];

  constructor(config: HandoffConfig, reps: SalesRep[] = []) {
    this.config = config;
    this.reps = reps;
  }

  // Check if current time is within business hours
  isWithinBusinessHours(): boolean {
    if (!this.config.businessHours) return true;

    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof this.config.businessHours.days;
    const dayConfig = this.config.businessHours.days[day];
    
    if (!dayConfig.enabled) return false;

    // Convert time strings to minutes for comparison
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = this.parseTime(dayConfig.start);
    const endMinutes = this.parseTime(dayConfig.end);

    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get availability status for a specific rep
  async getRepAvailability(repId: string): Promise<AvailabilityStatus> {
    const rep = this.reps.find(r => r.id === repId);
    if (!rep || !rep.isActive) {
      return {
        status: 'offline',
        lastUpdated: new Date()
      };
    }

    // Check multiple availability sources
    const availabilityChecks = await Promise.all([
      this.checkCalendarAvailability(rep),
      this.checkSlackStatus(rep),
      this.checkManualStatus(rep)
    ]);

    // Combine availability from all sources (most restrictive wins)
    let finalStatus: 'available' | 'busy' | 'offline' = 'available';
    let nextAvailable: Date | undefined;
    let currentMeeting: AvailabilityStatus['currentMeeting'];

    for (const check of availabilityChecks) {
      if (check.status === 'offline') {
        finalStatus = 'offline';
        break;
      }
      if (check.status === 'busy') {
        finalStatus = 'busy';
        if (check.nextAvailable && (!nextAvailable || check.nextAvailable < nextAvailable)) {
          nextAvailable = check.nextAvailable;
        }
        if (check.currentMeeting) {
          currentMeeting = check.currentMeeting;
        }
      }
    }

    return {
      status: finalStatus,
      nextAvailable,
      currentMeeting,
      lastUpdated: new Date()
    };
  }

  // Check calendar availability (Google Calendar, Outlook, etc.)
  private async checkCalendarAvailability(rep: SalesRep): Promise<AvailabilityStatus> {
    // This would integrate with calendar APIs
    // For now, implementing a mock that can be replaced with real API calls
    
    try {
      // Mock calendar check - in real implementation, this would call:
      // - Google Calendar API
      // - Microsoft Graph API
      // - CalDAV endpoints
      
      const response = await this.mockCalendarAPI(rep.email);
      
      if (response.busy) {
        return {
          status: 'busy',
          nextAvailable: response.nextFree,
          currentMeeting: response.currentEvent ? {
            title: response.currentEvent.title,
            endTime: new Date(response.currentEvent.endTime)
          } : undefined,
          lastUpdated: new Date()
        };
      }

      return {
        status: 'available',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.warn('Calendar availability check failed:', error);
      return {
        status: 'available', // Default to available if check fails
        lastUpdated: new Date()
      };
    }
  }

  // Mock calendar API - replace with real implementation
  private async mockCalendarAPI(_email: string): Promise<{
    busy: boolean;
    nextFree?: Date;
    currentEvent?: { title: string; endTime: string };
  }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock logic: busy during typical meeting hours
    const hour = new Date().getHours();
    const isMeetingTime = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
    
    if (isMeetingTime) {
      const nextHour = new Date();
      nextHour.setHours(hour + 1, 0, 0, 0);
      
      return {
        busy: true,
        nextFree: nextHour,
        currentEvent: {
          title: 'Client Meeting',
          endTime: nextHour.toISOString()
        }
      };
    }

    return { busy: false };
  }

  // Check Slack status
  private async checkSlackStatus(rep: SalesRep): Promise<AvailabilityStatus> {
    if (!rep.slackUserId || !this.config.slackConfig?.webhookUrl) {
      return {
        status: 'available',
        lastUpdated: new Date()
      };
    }

    try {
      // This would call Slack API to get user presence
      const slackStatus = await this.mockSlackAPI(rep.slackUserId);
      
      return {
        status: slackStatus.presence === 'away' ? 'offline' : 
               slackStatus.dnd ? 'busy' : 'available',
        nextAvailable: slackStatus.dndUntil ? new Date(slackStatus.dndUntil) : undefined,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.warn('Slack status check failed:', error);
      return {
        status: 'available',
        lastUpdated: new Date()
      };
    }
  }

  // Mock Slack API - replace with real Slack Web API calls
  private async mockSlackAPI(userId: string): Promise<{
    presence: 'active' | 'away';
    dnd: boolean;
    dndUntil?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Mock: randomly set to DND during lunch hours
    const hour = new Date().getHours();
    const isDndTime = hour >= 12 && hour <= 13;
    
    return {
      presence: 'active',
      dnd: isDndTime,
      dndUntil: isDndTime ? new Date(Date.now() + 3600000).toISOString() : undefined
    };
  }

  // Check manual status override
  private async checkManualStatus(rep: SalesRep): Promise<AvailabilityStatus> {
    // This could check a database/cache for manual status overrides
    // For now, return available (manual overrides would be implemented separately)
    return {
      status: 'available',
      lastUpdated: new Date()
    };
  }

  // Get the best available rep
  async getBestAvailableRep(): Promise<{ rep: SalesRep; availability: AvailabilityStatus } | null> {
    if (!this.isWithinBusinessHours()) {
      return null;
    }

    const repAvailabilities = await Promise.all(
      this.reps.map(async (rep) => ({
        rep,
        availability: await this.getRepAvailability(rep.id)
      }))
    );

    // Priority: available > busy > offline
    const available = repAvailabilities.find(ra => ra.availability.status === 'available');
    if (available) return available;

    const busy = repAvailabilities
      .filter(ra => ra.availability.status === 'busy')
      .sort((a, b) => {
        const aNext = a.availability.nextAvailable?.getTime() || Infinity;
        const bNext = b.availability.nextAvailable?.getTime() || Infinity;
        return aNext - bNext;
      })[0];

    return busy || null;
  }

  // Send Slack notification for qualified lead
  async sendSlackNotification(conversation: Conversation): Promise<boolean> {
    if (!this.config.enableSlackNotifications || !this.config.slackConfig) {
      return false;
    }

    try {
      const notification: SlackNotification = {
        lead: {
          name: conversation.prospect.name,
          email: conversation.prospect.email,
          company: conversation.prospect.company,
          score: conversation.qualificationStatus.score
        },
        conversation: {
          summary: this.generateConversationSummary(conversation),
          keyPoints: this.extractKeyPoints(conversation),
          painPoints: conversation.prospect.painPoints || [],
          qualificationDetails: conversation.qualificationStatus.criteria
        },
        urgency: this.determineUrgency(conversation.qualificationStatus.score),
        sessionUrl: `${window.location.origin}/session/${conversation.sessionId}`
      };

      await this.postToSlack(notification);
      return true;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }

  private generateConversationSummary(conversation: Conversation): string {
    const messageCount = conversation.messages.length;
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) {
      return 'New lead started conversation but hasn\'t provided details yet.';
    }

    const lastMessage = userMessages[userMessages.length - 1];
    return `${messageCount} messages exchanged. Latest: "${lastMessage.content.substring(0, 100)}${lastMessage.content.length > 100 ? '...' : ''}"`;
  }

  private extractKeyPoints(conversation: Conversation): string[] {
    const keyPoints: string[] = [];
    const prospect = conversation.prospect;
    
    if (prospect.company) keyPoints.push(`Company: ${prospect.company}`);
    if (prospect.title) keyPoints.push(`Title: ${prospect.title}`);
    if (prospect.industry) keyPoints.push(`Industry: ${prospect.industry}`);
    if (prospect.companySize) keyPoints.push(`Company Size: ${prospect.companySize}`);
    if (prospect.budget) keyPoints.push(`Budget: ${prospect.budget}`);
    if (prospect.timeline) keyPoints.push(`Timeline: ${prospect.timeline}`);

    return keyPoints;
  }

  private determineUrgency(score: number): 'low' | 'medium' | 'high' {
    if (score >= 90) return 'high';
    if (score >= 75) return 'medium';
    return 'low';
  }

  private async postToSlack(notification: SlackNotification): Promise<void> {
    if (!this.config.slackConfig?.webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const urgencyColor = {
      low: '#36a64f',
      medium: '#ff9500', 
      high: '#ff0000'
    };

    const mentions = this.config.slackConfig.mentionUsers?.map(u => `<@${u}>`).join(' ') || '';

    const payload = {
      text: `🔥 New qualified lead! ${mentions}`,
      attachments: [{
        color: urgencyColor[notification.urgency],
        title: `${notification.lead.name || 'Anonymous'} (Score: ${notification.lead.score}%)`,
        title_link: notification.sessionUrl,
        fields: [
          {
            title: 'Company',
            value: notification.lead.company || 'Not provided',
            short: true
          },
          {
            title: 'Email',
            value: notification.lead.email || 'Not captured',
            short: true
          },
          {
            title: 'Qualification Score',
            value: `${notification.lead.score}% (${notification.urgency} priority)`,
            short: true
          },
          {
            title: 'Pain Points',
            value: notification.conversation.painPoints.length > 0 
              ? notification.conversation.painPoints.join(', ')
              : 'None identified',
            short: true
          }
        ],
        text: `*Conversation Summary:*\n${notification.conversation.summary}\n\n*Key Points:*\n${notification.conversation.keyPoints.map(p => `• ${p}`).join('\n')}`,
        footer: 'SalesFusion Sales Room',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    const response = await fetch(this.config.slackConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
  }

  // Configuration management
  updateConfig(config: Partial<HandoffConfig>): void {
    this.config = { ...this.config, ...config };
  }

  updateReps(reps: SalesRep[]): void {
    this.reps = reps;
  }

  getConfig(): HandoffConfig {
    return this.config;
  }

  getReps(): SalesRep[] {
    return this.reps;
  }
}

// Default handoff configuration
export const DEFAULT_HANDOFF_CONFIG: HandoffConfig = {
  enableTalkNow: true,
  enableSlackNotifications: true,
  availabilitySources: ['calendar', 'slack'],
  scoreThresholdForHandoff: 75,
  businessHours: {
    timezone: 'America/New_York',
    days: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '17:00', enabled: false },
      sunday: { start: '09:00', end: '17:00', enabled: false }
    }
  }
};

export const handoffService = new HandoffService(DEFAULT_HANDOFF_CONFIG);