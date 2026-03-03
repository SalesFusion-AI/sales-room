const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface WorkspaceConfig {
  name: string;
  slug: string;
  branding: {
    primaryColor: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  messaging: {
    welcomeMessage: string;
    placeholderText: string;
  };
}

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  name: 'SalesFusion',
  slug: 'default',
  branding: {
    primaryColor: '#ffffff',
    secondaryColor: '#0b0b0b',
  },
  messaging: {
    welcomeMessage: "Hi! I'm here to help you learn about our AI sales platform. What brings you here today?",
    placeholderText: 'Type your message...',
  },
};

export async function fetchWorkspaceConfig(workspaceSlug: string): Promise<WorkspaceConfig> {
  const response = await fetch(`${API_URL}/api/room/${encodeURIComponent(workspaceSlug)}/config`);
  if (!response.ok) {
    throw new Error(`Failed to fetch workspace config: ${response.status}`);
  }

  const data = await response.json() as WorkspaceConfig;
  return {
    ...DEFAULT_WORKSPACE_CONFIG,
    ...data,
    branding: { ...DEFAULT_WORKSPACE_CONFIG.branding, ...data.branding },
    messaging: { ...DEFAULT_WORKSPACE_CONFIG.messaging, ...data.messaging },
  };
}

