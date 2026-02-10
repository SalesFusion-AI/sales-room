/**
 * Chat Service - Connects Sales Room to Pipeline Bot AI
 */

import { useSettingsStore } from '../store/settingsStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

    // Create AbortController for timeout handling
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30 second timeout

    let response: Response;
    
    try {
      response = await fetch(`${API_URL}/api/chat`, {
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
        signal: abortController.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle network errors, timeouts, and CORS issues
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          // Fallback to demo mode for network issues
          return {
            success: true,
            response: getDemoResponse(message),
            sessionId: sessionId || `demo_${Date.now()}`,
          };
        }
      }
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    clearTimeout(timeoutId);

    let data: ChatResponse | { error?: string };

    try {
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid response format from chat service');
    }

    if (!response.ok) {
      const errorMessage = (data as { error?: string }).error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Validate response structure
    const chatResponse = data as ChatResponse;
    if (!chatResponse.response || typeof chatResponse.response !== 'string') {
      throw new Error('Invalid response structure from chat service');
    }

    return {
      success: chatResponse.success ?? true,
      response: chatResponse.response,
      sessionId: chatResponse.sessionId || sessionId || `session_${Date.now()}`,
    };
    
  } catch (error) {
    console.error('Chat service error:', error);
    
    // For any error, provide fallback behavior
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Don't fallback to demo for validation/parsing errors - those indicate real issues
    if (errorMessage.includes('Invalid response') || errorMessage.includes('timeout')) {
      throw error;
    }
    
    // Fallback to demo mode for network/fetch errors
    if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
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
