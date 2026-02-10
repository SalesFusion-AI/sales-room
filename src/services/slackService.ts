import { getQualificationConfig } from '../../qualification.config';
import type { ProspectInfo } from '../types';

export interface SlackNotificationData {
  prospectName: string;
  company?: string;
  email?: string;
  score: number;
  previousScore?: number;
  qualifiedFields: string[];
  sessionId: string;
  timestamp: Date;
}

export interface SlackMessage {
  text: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

class SlackService {
  private config = getQualificationConfig();

  /**
   * Send qualification update to Slack
   */
  async sendQualificationUpdate(data: SlackNotificationData): Promise<boolean> {
    if (!this.config.slack.enabled || !this.config.slack.webhookUrl) {
      console.log('Slack notifications disabled or webhook URL not configured');
      return false;
    }

    // Check if this qualifies for notification
    if (!this.shouldNotify(data.score, data.previousScore)) {
      return false;
    }

    const message = this.buildSlackMessage(data);

    try {
      const response = await fetch(this.config.slack.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Slack notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error);
      return false;
    }
  }

  /**
   * Determine if score change warrants notification
   */
  private shouldNotify(currentScore: number, previousScore?: number): boolean {
    // Always notify for significant score jumps
    if (previousScore !== undefined) {
      const change = currentScore - previousScore;
      if (Math.abs(change) >= this.config.thresholds.significantChange) {
        return true;
      }
    }

    // Notify when crossing important thresholds
    return this.config.slack.notifyOnThresholds.some(threshold => {
      if (previousScore === undefined) {
        return currentScore >= threshold;
      }
      
      // Crossing threshold from below
      return previousScore < threshold && currentScore >= threshold;
    });
  }

  /**
   * Build formatted Slack message
   */
  private buildSlackMessage(data: SlackNotificationData): SlackMessage {
    const { prospectName, company, email, score, previousScore, qualifiedFields, sessionId } = data;
    
    const scoreChange = previousScore !== undefined ? score - previousScore : 0;
    const scoreEmoji = this.getScoreEmoji(score);
    const trendEmoji = scoreChange > 0 ? '📈' : scoreChange < 0 ? '📉' : '📊';
    
    const leadType = score >= 85 ? 'HOT 🔥' : score >= 60 ? 'WARM 🟡' : 'COLD 🔵';
    
    let mainText = `${scoreEmoji} *New ${leadType} Lead Qualification Update*\n`;
    
    if (scoreChange > 0) {
      mainText += `${trendEmoji} Score increased by +${scoreChange} points!\n`;
    }
    
    // Build blocks for rich formatting
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: mainText
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Prospect:*\n${prospectName}`
          },
          {
            type: 'mrkdwn',
            text: `*Score:*\n${score}% ${previousScore !== undefined ? `(was ${previousScore}%)` : ''}`
          },
          {
            type: 'mrkdwn',
            text: `*Company:*\n${company || 'Not provided'}`
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${email || 'Not provided'}`
          }
        ]
      }
    ];

    // Add qualified fields if any
    if (qualifiedFields.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Qualified Areas:* ${qualifiedFields.join(', ')}`
        }
      });
    }

    // Add action buttons for high-score leads
    if (score >= this.config.thresholds.showTalkToSales) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎯 *This prospect is ready for sales outreach!* _(Session: ${sessionId.slice(-8)})_`
        }
      });
    }

    return {
      text: `${scoreEmoji} New lead qualification: ${prospectName} (${score}%)`,
      blocks
    };
  }

  /**
   * Get appropriate emoji for score
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🎯';
    if (score >= 80) return '🔥';
    if (score >= 70) return '⚡';
    if (score >= 60) return '✨';
    if (score >= 50) return '🟡';
    return '🔵';
  }

  /**
   * Test Slack webhook connectivity
   */
  async testWebhook(): Promise<boolean> {
    if (!this.config.slack.webhookUrl) {
      return false;
    }

    const testMessage = {
      text: '🧪 SalesFusion Sales Room - Webhook Test',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '✅ *Slack integration is working!*\nYou will receive qualification notifications here.'
          }
        }
      ]
    };

    try {
      const response = await fetch(this.config.slack.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMessage),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const slackService = new SlackService();