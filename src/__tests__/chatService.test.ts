import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../store/settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({ aiModel: 'GPT-4o', aiApiKey: 'test-key' }),
  },
}));

describe('chatService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a message with settings and returns response', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, response: 'Hi there', sessionId: 'session-1' }),
        { status: 200 }
      )
    );
    vi.stubGlobal('fetch', mockFetch);

    const { sendMessage } = await import('../services/chatService');
    const result = await sendMessage('Hello', null, { prospectName: 'Ada' });

    expect(result).toEqual({
      success: true,
      response: 'Hi there',
      sessionId: 'session-1',
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0]?.[1]?.body as string);
    expect(body).toMatchObject({
      message: 'Hello',
      sessionId: null,
      model: 'GPT-4o',
      apiKey: 'test-key',
    });
  });

  it('deduplicates in-flight requests for the same payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, response: 'Hello again', sessionId: 'session-2' }),
        { status: 200 }
      )
    );
    vi.stubGlobal('fetch', mockFetch);

    const { sendMessage } = await import('../services/chatService');

    const promise1 = sendMessage('Ping', 'abc', { company: 'SalesFusion' });
    const promise2 = sendMessage('Ping', 'abc', { company: 'SalesFusion' });
    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toEqual(result2);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
