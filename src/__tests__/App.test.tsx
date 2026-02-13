import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

vi.mock('../store/chatStore', () => ({
  useChatStore: (selector: (state: any) => any) => selector({
    sendUserMessage: vi.fn()
  }),
  useMessages: () => ([
    { id: '1', content: 'Welcome', role: 'assistant', timestamp: new Date() }
  ]),
  useIsTyping: () => false,
  useProspectInfo: () => ({ name: 'Test User' }),
  useError: () => null
}));

vi.mock('../components/TalkToSales/TalkToSalesButton', () => ({
  default: () => <div data-testid="talk-to-sales" />
}));

vi.mock('../components/Settings/SettingsButton', () => ({
  default: () => <button type="button">Settings</button>
}));

vi.mock('../components/Settings/SettingsPanel', () => ({
  default: () => <div data-testid="settings-panel" />
}));

describe('App', () => {
  it('renders the main header and input', () => {
    render(<App />);

    expect(screen.getByText('SalesFusion AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByTestId('talk-to-sales')).toBeInTheDocument();
  });
});
