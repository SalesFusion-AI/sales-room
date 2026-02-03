/**
 * Chat Service - Connects Sales Room to Pipeline Bot AI
 */

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
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        context,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Chat request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat service error:', error);
    
    // Fallback to demo mode if API is unavailable
    if (error instanceof TypeError && error.message.includes('fetch')) {
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
  
  if (lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
    return "Our pricing is customized based on your needs. We typically work with companies doing $10k-$200k/month who want to scale without hiring. What's your current monthly revenue range?";
  }
  
  if (lowerMessage.includes('demo') || lowerMessage.includes('see it')) {
    return "I'd love to show you how it works! Based on our conversation, I think you'd be a great fit. Should I connect you with our team for a personalized demo?";
  }
  
  if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
    return "We combine AI automation with human excellence. Our AI handles lead qualification, follow-ups, and meeting prep 24/7, while your team focuses on closing. Most clients see 2x revenue in 90 days. What's your biggest sales bottleneck right now?";
  }
  
  return "That's interesting! Tell me more about your current sales process and what challenges you're facing. I'm here to help figure out if we're a good fit.";
}

export default { sendMessage };
