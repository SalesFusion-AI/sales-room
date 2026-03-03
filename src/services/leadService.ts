const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface LeadPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  company?: string;
  title?: string;
  phone?: string;
  painPoints?: string[];
  timeline?: string;
  budget?: string;
  industry?: string;
  tags?: string[];
  qualificationScore?: number;
  leadScore?: number;
  summary?: string;
  transcript?: string;
  sessionId?: string;
  conversationDuration?: number;
  messageCount?: number;
}

export interface LeadResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function createLead(payload: LeadPayload, workspaceSlug?: string): Promise<LeadResult> {
  const endpoint = workspaceSlug
    ? `${API_URL}/api/room/${encodeURIComponent(workspaceSlug)}/leads`
    : `${API_URL}/api/crm/leads`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      error: errorText || `Lead request failed (${response.status})`,
    };
  }

  const data = await response.json() as { id?: string; success?: boolean };
  return {
    success: data.success ?? true,
    id: data.id,
  };
}

