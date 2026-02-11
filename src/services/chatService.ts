/**
 * Chat Service - Connects Sales Room to Pipeline Bot AI
 */

import { useSettingsStore } from '../store/settingsStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const DEFAULT_TIMEOUT_MS = 15000;

class ChatServiceError extends Error {
  constructor(
    message: string,
    public readonly type: 'network' | 'timeout' | 'api' | 'parse'
  ) {
    super(message);
    this.name = 'ChatServiceError';
  }
}

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

interface ChatContext {
  prospectName?: string;
  company?: string;
  email?: string;
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatResponse {
  success: boolean;
  response: string;
  sessionId: string;
  error?: string;
}

export async function sendMessage(
  message: string,
  sessionId: string | null,
  context: ChatContext
): Promise<ChatResponse> {
  try {
    const { aiModel, aiApiKey } = useSettingsStore.getState();

    const response = await fetchWithTimeout(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        context,
        model: aiModel,
        apiKey: aiApiKey,
      }),
    });

    let data: ChatResponse | { error?: string } | null = null;
    const contentType = response.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        data = (await response.json()) as ChatResponse | { error?: string };
      } else {
        const text = await response.text();
        data = text ? ({ error: text } as { error?: string }) : null;
      }
    } catch (parseError) {
      throw new ChatServiceError('Invalid response from chat service.', 'parse');
    }

    if (!response.ok) {
      const apiError = data?.error || `Chat request failed (${response.status})`;
      throw new ChatServiceError(apiError, 'api');
    }

    if (!data || !(data as ChatResponse).response) {
      throw new ChatServiceError('Chat response was empty.', 'parse');
    }

    return data as ChatResponse;
  } catch (error) {
    console.error('Chat service error:', error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ChatServiceError('Chat request timed out. Please try again.', 'timeout');
    }

    if (error instanceof TypeError) {
      // Fallback to demo mode if API is unavailable
      return {
        success: true,
        response: getDemoResponse(message),
        sessionId: sessionId || `demo_${Date.now()}`,
      };
    }

    throw error;
  }
}

// Demo fallback responses when API is not available
function getDemoResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
    return "Great question. Most teams invest between $2k–$8k/mo depending on volume and complexity. We tailor it based on lead volume, channels, and the level of automation you want. Roughly how many inbound leads or demo requests do you handle each month?";
  }

  if (lowerMessage.includes('budget') || lowerMessage.includes('roi')) {
    return "Totally makes sense to sanity‑check ROI. Our customers usually see a 25–40% lift in qualified pipeline within the first 60–90 days. If you had to ballpark, what budget range feels realistic for solving this?";
  }

  if (lowerMessage.includes('demo') || lowerMessage.includes('see it') || lowerMessage.includes('show me')) {
    return "Absolutely — I can get you a tailored demo. If you'd like, you can grab a time here: https://calendly.com/salesfusion. Before we book, what would you want to see most (lead qualification, follow‑ups, or CRM sync)?";
  }

  if (lowerMessage.includes('timeline') || lowerMessage.includes('by ') || lowerMessage.includes('this quarter') || lowerMessage.includes('next month')) {
    return "Got it. We typically onboard teams in 2–3 weeks, then optimize over the next month. When are you hoping to have something live?";
  }

  if (lowerMessage.includes('integrat') || lowerMessage.includes('crm') || lowerMessage.includes('salesforce') || lowerMessage.includes('hubspot')) {
    return "We integrate with HubSpot, Salesforce, and most modern CRMs. Setup is usually a few hours with no heavy engineering lift. What CRM are you currently using?";
  }

  if (lowerMessage.includes('pain') || lowerMessage.includes('problem') || lowerMessage.includes('challenge') || lowerMessage.includes('struggl')) {
    return "Thanks for sharing that. We see that a lot — especially when teams are scaling. If we could fix one thing first, would it be lead response time, qualification quality, or follow‑up consistency?";
  }

  if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('it works'))) {
    return "We combine AI-led qualification with human‑ready handoffs. The AI engages leads instantly, asks smart discovery questions, and surfaces a qualified summary to your reps. Teams usually see faster response times and higher show rates. What's your biggest sales bottleneck right now?";
  }

  if (lowerMessage.includes("i'm ") || lowerMessage.includes('my name is')) {
    return "Nice to meet you! What team are you on and what prompted you to look at SalesFusion today?";
  }

  return "Thanks for the context. To make sure we're a good fit, can I ask a couple quick questions about your lead volume and timeline?";
}

export default { sendMessage };
