/**
 * Slack Service - Routes qualification updates to Slack
 * 
 * This sends real-time notifications when prospects qualify,
 * keeping sales teams informed without exposing scores to prospects.
 */

interface QualificationNotification {
  prospectName: string;
  company: string;
  email: string;
  score: number;
  previousScore: number;
  criteriaMetCount: number;
  criteriaMet: string[];
  sessionId: string | null;
}

interface SlackWebhookPayload {
  text: string;
  blocks?: Array<{
    type: string;
    text?: { type: string; text: string; emoji?: boolean };
    fields?: Array<{ type: string; text: string }>;
    elements?: Array<{ type: string; text: string }>;
  }>;
}

const WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL || '';

// Track last notified score to avoid spam
let lastNotifiedScore = 0;
const NOTIFICATION_THRESHOLD = 10; // Only notify on 10%+ changes

/**
 * Send a qualification update to Slack
 */
export async function notifyQualificationChange(
  notification: QualificationNotification
): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.log('[SlackService] No webhook URL configured - skipping notification');
    return false;
  }

  // Only notify on significant changes (10%+ increase)
  const scoreDelta = notification.score - notification.previousScore;
  if (scoreDelta < NOTIFICATION_THRESHOLD && notification.score < 75) {
    return false;
  }

  // Don't re-notify for the same score
  if (notification.score === lastNotifiedScore) {
    return false;
  }

  lastNotifiedScore = notification.score;

  const emoji = getScoreEmoji(notification.score);
  const urgency = getUrgency(notification.score);

  const payload: SlackWebhookPayload = {
    text: `${emoji} ${notification.company || 'Unknown Company'} - ${notification.prospectName || 'Anonymous'}: ${notification.score}% qualified`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} New Lead Qualification Update`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Prospect:*\n${notification.prospectName || 'Not provided'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Company:*\n${notification.company || 'Not provided'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Qualification:*\n${notification.score}% ${urgency}`,
          },
          {
            type: 'mrkdwn',
            text: `*Criteria Met:*\n${notification.criteriaMetCount}/5`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Signals detected:* ${notification.criteriaMet.join(', ') || 'None yet'}`,
        },
      },
      ...(notification.email
        ? [
            {
              type: 'section' as const,
              text: {
                type: 'mrkdwn' as const,
                text: `*Email:* ${notification.email}`,
              },
            },
          ]
        : []),
      ...(notification.score >= 75
        ? [
            {
              type: 'context' as const,
              elements: [
                {
                  type: 'mrkdwn' as const,
                  text: '🔥 *HOT LEAD* - Ready for sales handoff!',
                },
              ],
            },
          ]
        : []),
    ],
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[SlackService] Webhook failed:', response.status);
      return false;
    }

    console.log('[SlackService] Notification sent successfully');
    return true;
  } catch (error) {
    console.error('[SlackService] Failed to send notification:', error);
    return false;
  }
}

/**
 * Send high-priority alert when prospect is ready for handoff
 */
export async function notifyHandoffReady(
  prospectName: string,
  company: string,
  email: string,
  score: number
): Promise<boolean> {
  if (!WEBHOOK_URL) {
    return false;
  }

  const payload: SlackWebhookPayload = {
    text: `🚨 HANDOFF READY: ${company} - ${prospectName} (${score}% qualified)`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Sales Handoff Ready!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${prospectName}* from *${company}* has requested to talk to sales!\n\nThey're *${score}% qualified* - this is a hot lead! 🔥`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Contact:*\n${email || 'No email provided'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Score:*\n${score}%`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Respond within 5 minutes for best conversion rates!',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('[SlackService] Failed to send handoff notification:', error);
    return false;
  }
}

function getScoreEmoji(score: number): string {
  if (score >= 80) return '🔥';
  if (score >= 60) return '⭐';
  if (score >= 40) return '📈';
  return '👋';
}

function getUrgency(score: number): string {
  if (score >= 80) return '(HOT!)';
  if (score >= 60) return '(Warm)';
  return '';
}

/**
 * Reset notification state (for testing or new sessions)
 */
export function resetNotificationState(): void {
  lastNotifiedScore = 0;
}
