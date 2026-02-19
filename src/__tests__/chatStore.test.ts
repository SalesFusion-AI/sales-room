import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../services/chatService', () => ({
  sendMessage: vi.fn(),
}));

vi.mock('../services/qualificationService', () => ({
  qualificationService: {
    initializeQualificationStatus: () => ({
      schemaId: 'test',
      criteria: {},
      score: 0,
      readyToConnect: false,
      lastUpdated: new Date(),
    }),
    assessQualificationFromMessages: vi.fn().mockResolvedValue({
      criteria: {},
      score: 0,
      readyToConnect: false,
      lastUpdated: new Date(),
    }),
  },
}));

vi.mock('../demo/demoService', () => ({
  demoService: {
    isDemoActive: () => false,
    initializeDemoEnvironment: vi.fn(),
  },
}));

vi.mock('../services/slackService', () => ({
  notifyQualificationChange: vi.fn().mockResolvedValue(true),
  resetNotificationState: vi.fn(),
}));

describe('chatStore actions', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const loadStore = async () => {
    const module = await import('../store/chatStore');
    return module.useChatStore;
  };

  it('sanitizes and stores prospect info updates', async () => {
    const useChatStore = await loadStore();
    const { setProspectInfo } = useChatStore.getState();

    setProspectInfo({
      name: '  Ada Lovelace  ',
      email: 'TEST@EXAMPLE.COM',
      company: 'SalesFusion <script>',
    });

    const state = useChatStore.getState();
    expect(state.prospectInfo.name).toBe('Ada Lovelace');
    expect(state.prospectInfo.email).toBe('test@example.com');
    expect(state.prospectInfo.company).toBe('SalesFusion');
  });

  it('sets validation errors for invalid messages', async () => {
    const useChatStore = await loadStore();
    const { sendUserMessage } = useChatStore.getState();

    await sendUserMessage('');

    const state = useChatStore.getState();
    expect(state.error).toBe('Message cannot be empty');
    expect(state.isProcessingMessage).toBe(false);
  });

  it('adds user and assistant messages on successful send', async () => {
    const useChatStore = await loadStore();
    const chatService = await import('../services/chatService');

    vi.mocked(chatService.sendMessage).mockResolvedValue({
      success: true,
      response: 'AI response',
      sessionId: 'session-1',
    });

    const { sendUserMessage } = useChatStore.getState();
    await sendUserMessage('Hello there');

    const state = useChatStore.getState();
    expect(state.messages[state.messages.length - 2]?.role).toBe('user');
    expect(state.messages[state.messages.length - 1]?.role).toBe('assistant');
    expect(state.isTyping).toBe(false);
    expect(state.isProcessingMessage).toBe(false);
    expect(state.sessionId).toBe('session-1');
  });
});
