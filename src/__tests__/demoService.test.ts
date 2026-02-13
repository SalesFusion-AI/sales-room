import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeConversation = vi.fn();
const getConversationBySessionId = vi.fn();
const updateReps = vi.fn();
const setExpiringSessionItem = vi.fn();
const setSessionItem = vi.fn();
const removeSessionItem = vi.fn();
const getSessionItem = vi.fn();

vi.mock('../services/transcriptService', () => ({
  transcriptService: {
    storeConversation,
    getConversationBySessionId
  }
}));

vi.mock('../services/handoffService', () => ({
  handoffService: {
    updateReps
  }
}));

vi.mock('../utils/sessionStorage', () => ({
  setExpiringSessionItem,
  getExpiringSessionItem: vi.fn(),
  removeSessionItem,
  setSessionItem,
  getSessionItem
}));

const demoConversations = [
  {
    id: 'demo-1',
    sessionId: 'demo-session-001',
    messages: [],
    prospect: {},
    qualificationStatus: { score: 90, criteria: {}, schemaId: 'bant', readyToConnect: true, lastUpdated: new Date() },
    tags: [],
    crmSynced: true,
    lastActivity: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'demo-2',
    sessionId: 'demo-session-002',
    messages: [],
    prospect: {},
    qualificationStatus: { score: 50, criteria: {}, schemaId: 'bant', readyToConnect: false, lastUpdated: new Date() },
    tags: [],
    crmSynced: false,
    lastActivity: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const demoSummaries = [
  { id: 'summary-1', sessionId: 'demo-session-001' }
];

const demoSalesReps = [{ id: 'rep-1', name: 'Demo Rep' }];

const demoAnalytics = { conversationsStarted: 2 };
const demoOnboarding = [{ id: 1, task: 'Setup', completed: true }];
const demoScript = { intro: { title: 'Intro', duration: '1m', keyPoints: [] } };

vi.mock('../demo/demoData', () => ({
  DEMO_CONVERSATIONS: demoConversations,
  DEMO_SUMMARIES: demoSummaries,
  DEMO_SALES_REPS: demoSalesReps,
  DEMO_ANALYTICS: demoAnalytics,
  DEMO_ONBOARDING_CHECKLIST: demoOnboarding,
  WEBINAR_DEMO_SCRIPT: demoScript
}));

const { demoService } = await import('../demo/demoService');

describe('demoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes demo environment and loads data', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await demoService.initializeDemoEnvironment();

    expect(removeSessionItem).toHaveBeenCalledWith('salesfusion_transcripts');
    expect(removeSessionItem).toHaveBeenCalledWith('salesfusion_summaries');
    expect(removeSessionItem).toHaveBeenCalledWith('demo_analytics');
    expect(removeSessionItem).toHaveBeenCalledWith('demo_onboarding');

    expect(storeConversation).toHaveBeenCalledTimes(demoConversations.length);
    expect(setExpiringSessionItem).toHaveBeenCalledTimes(demoSummaries.length);
    expect(updateReps).toHaveBeenCalledWith(demoSalesReps);
    expect(setSessionItem).toHaveBeenCalledWith('demo_analytics', JSON.stringify(demoAnalytics));
    expect(setSessionItem).toHaveBeenCalledWith('demo_onboarding', JSON.stringify(demoOnboarding));

    logSpy.mockRestore();
  });

  it('returns demo analytics from storage when present', () => {
    getSessionItem.mockReturnValueOnce(JSON.stringify({ conversationsStarted: 99 }));
    const result = demoService.getDemoAnalytics();
    expect(result).toEqual({ conversationsStarted: 99 });
  });

  it('returns demo conversation by scenario', () => {
    getConversationBySessionId.mockReturnValueOnce(demoConversations[0]);
    const result = demoService.getDemoConversation('hot');
    expect(result).toEqual(demoConversations[0]);
  });

  it('computes demo performance metrics', () => {
    const result = demoService.getDemoPerformance();

    expect(result.totalConversations).toBe(2);
    expect(result.qualificationRate).toBe(50);
    expect(result.averageScore).toBe(70);
    expect(result.hotLeads).toBe(1);
    expect(result.readyToConnect).toBe(1);
    expect(result.crmSynced).toBe(1);
  });
});
