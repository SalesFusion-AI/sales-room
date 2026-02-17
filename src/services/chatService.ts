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

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export async function sendMessage(
  message: string,
  sessionId: string | null,
  context: ChatContext
): Promise<ChatResponse> {
  // Input validation
  if (!message || typeof message !== 'string') {
    throw new ApiError('Message is required and must be a string');
  }

  if (message.trim().length === 0) {
    throw new ApiError('Message cannot be empty');
  }

  if (message.length > 10000) {
    throw new ApiError('Message is too long (max 10,000 characters)');
  }

  try {
    const { aiModel, aiApiKey } = useSettingsStore.getState();

    // Validate required settings
    if (!aiApiKey || aiApiKey.trim().length === 0) {
      console.warn('No API key configured, falling back to demo mode');
      return {
        success: true,
        response: getDemoResponse(message),
        sessionId: sessionId || `demo_${Date.now()}`,
      };
    }

    // Create AbortController for timeout handling with longer timeout for complex requests
    const abortController = new AbortController();
    const timeoutMs = context.previousMessages?.length && context.previousMessages.length > 10 ? 45000 : 30000;
    const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

    let response: Response;
    
    try {
      response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          sessionId,
          context: {
            ...context,
            // Ensure context data is clean
            prospectName: context.prospectName?.trim(),
            company: context.company?.trim(),
            email: context.email?.trim(),
          },
          model: aiModel,
          apiKey: aiApiKey,
        }),
        signal: abortController.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle different types of network errors with more specificity
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          const apiError = new ApiError('Request timeout - the server took too long to respond. Please try again.');
          apiError.code = 'TIMEOUT';
          throw apiError;
        }
        
        if (fetchError.message.includes('Failed to fetch')) {
          console.warn('Network connectivity issue, falling back to demo mode');
          return {
            success: true,
            response: getDemoResponse(message),
            sessionId: sessionId || `demo_${Date.now()}`,
          };
        }
        
        if (fetchError.message.includes('NetworkError')) {
          const apiError = new ApiError('Network connection failed. Please check your internet connection.');
          apiError.code = 'NETWORK_ERROR';
          throw apiError;
        }
      }
      
      const apiError = new ApiError(`Connection error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`);
      apiError.code = 'CONNECTION_ERROR';
      throw apiError;
    }
    
    clearTimeout(timeoutId);

    // Handle HTTP error responses
    if (!response.ok) {
      let errorData: { error?: string; details?: string } = {};
      
      try {
        const errorText = await response.text();
        if (errorText.trim()) {
          errorData = JSON.parse(errorText);
        }
      } catch {
        // Ignore JSON parse errors for error responses
      }

      const apiError = new ApiError(
        errorData.error || 
        `Server error (${response.status}): ${response.statusText || 'Unknown error'}`
      );
      apiError.status = response.status;
      
      // Map specific HTTP status codes to user-friendly messages
      switch (response.status) {
        case 400:
          apiError.message = 'Invalid request. Please check your input and try again.';
          apiError.code = 'BAD_REQUEST';
          break;
        case 401:
          apiError.message = 'Authentication failed. Please check your API key in settings.';
          apiError.code = 'UNAUTHORIZED';
          break;
        case 403:
          apiError.message = 'Access denied. Please check your API key permissions.';
          apiError.code = 'FORBIDDEN';
          break;
        case 429:
          apiError.message = 'Too many requests. Please wait a moment before trying again.';
          apiError.code = 'RATE_LIMITED';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          apiError.message = 'The server is temporarily unavailable. Please try again in a few minutes.';
          apiError.code = 'SERVER_ERROR';
          break;
        default:
          apiError.code = 'HTTP_ERROR';
      }
      
      throw apiError;
    }

    // Parse and validate response
    let data: ChatResponse;
    try {
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new ApiError('Server returned empty response');
      }
      
      const parsed = JSON.parse(responseText);
      
      // Validate response structure with detailed error messages
      if (!parsed || typeof parsed !== 'object') {
        throw new ApiError('Invalid response format: expected object');
      }
      
      if (!parsed.response || typeof parsed.response !== 'string') {
        throw new ApiError('Invalid response format: missing or invalid response text');
      }
      
      if (parsed.response.trim().length === 0) {
        throw new ApiError('Server returned empty response text');
      }
      
      data = parsed as ChatResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('JSON parse error:', error);
      const apiError = new ApiError('Invalid response format from server');
      apiError.code = 'PARSE_ERROR';
      throw apiError;
    }

    // Additional response validation
    if (data.response.length > 50000) {
      console.warn('Response is unusually long, truncating for safety');
      data.response = data.response.substring(0, 50000) + '... [Response truncated for safety]';
    }

    return {
      success: data.success ?? true,
      response: data.response,
      sessionId: data.sessionId || sessionId || `session_${Date.now()}`,
    };
    
  } catch (error) {
    console.error('Chat service error:', error);
    
    // Handle ApiError instances with specific codes
    if (error instanceof ApiError) {
      // Don't fallback to demo for validation/parsing errors or auth issues
      if (['PARSE_ERROR', 'BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN'].includes(error.code || '')) {
        throw error;
      }
      
      // Fallback to demo for network/server issues
      if (['NETWORK_ERROR', 'CONNECTION_ERROR', 'SERVER_ERROR', 'TIMEOUT'].includes(error.code || '')) {
        console.warn(`${error.code}: falling back to demo mode`);
        return {
          success: true,
          response: getDemoResponse(message),
          sessionId: sessionId || `demo_${Date.now()}`,
        };
      }
      
      throw error;
    }
    
    // Handle generic errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Create proper ApiError for unknown errors
    const apiError = new ApiError(errorMessage);
    apiError.code = 'UNKNOWN_ERROR';
    
    // Fallback to demo for certain generic error patterns
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      console.warn('Generic network error, falling back to demo mode');
      return {
        success: true,
        response: getDemoResponse(message),
        sessionId: sessionId || `demo_${Date.now()}`,
      };
    }
    
    throw apiError;
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

// Create a custom error class for better error handling
function ApiError(message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  return error;
}

export { ApiError };
export default { sendMessage };
