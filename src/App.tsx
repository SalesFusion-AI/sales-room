import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, MessageSquare, User, AlertCircle } from 'lucide-react';
import { useChatStore, useMessages, useIsTyping, useProspectInfo, useError } from './store/chatStore';
import { validateMessage } from './utils/validation';
import TalkToSalesButton from './components/TalkToSales/TalkToSalesButton';
import SettingsButton from './components/Settings/SettingsButton';
import SettingsPanel from './components/Settings/SettingsPanel';
import QualificationProgress from './components/Progress/QualificationProgress';
import ConfettiCelebration from './components/Celebration/ConfettiCelebration';
import LoadDemoButton from './components/Demo/LoadDemoButton';
import MessageBubble from './components/Chat/MessageBubble';
import TypingIndicator from './components/Chat/TypingIndicator';
import './App.css';

function App() {
  // Use optimized selectors to prevent unnecessary re-renders
  const sendUserMessage = useChatStore(useCallback(s => s.sendUserMessage, []));
  const messages = useMessages();
  const isTyping = useIsTyping();
  const prospectInfo = useProspectInfo();
  const error = useError();
  const [inputMessage, setInputMessage] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Validate input as user types
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    
    // Clear previous error
    if (inputError) {
      setInputError(null);
    }
    
    // Validate if there's content
    if (value.trim()) {
      const validation = validateMessage(value, { maxLength: 500, minLength: 1 });
      if (!validation.isValid) {
        setInputError(validation.error || null);
      }
    }
  }, [inputError]);

  // Memoize handlers to prevent unnecessary re-renders of child components
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = inputMessage.trim();
    
    if (!trimmedMessage) {
      setInputError('Message cannot be empty');
      return;
    }
    
    if (isTyping) return;
    
    // Final validation before sending
    const validation = validateMessage(trimmedMessage, { maxLength: 500, minLength: 1 });
    if (!validation.isValid) {
      setInputError(validation.error || 'Invalid message');
      return;
    }
    
    setInputMessage('');
    setInputError(null);
    await sendUserMessage(trimmedMessage);
  }, [inputMessage, isTyping, sendUserMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handlePromptClick = useCallback((prompt: string) => {
    if (!isTyping) {
      setInputMessage('');
      setInputError(null);
      sendUserMessage(prompt);
    }
  }, [isTyping, sendUserMessage]);

  // Memoize suggested prompts to prevent recreation on every render
  const suggestedPrompts = useMemo(() => [
    "What does SalesFusion do?",
    "How does the AI work?",
    "Tell me about pricing",
    "I want to automate my sales",
    "Book a demo"
  ], []);

  return (
    <div className="min-h-screen h-[100svh] text-[var(--text-primary)] flex flex-col overflow-hidden relative z-10">
      {/* Header */}
      <header className="flex-shrink-0 bg-[rgba(28,28,30,0.75)] backdrop-blur-[20px] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#007AFF] to-[#0A84FF] rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-white truncate app-heading">SalesFusion AI</h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Your Sales Automation Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Prospect info indicator */}
              {prospectInfo.name && (
                <div className="flex items-center text-xs sm:text-sm">
                  <div className="flex items-center text-[var(--text-secondary)] bg-white/5 border border-white/10 px-3 py-2 rounded-full backdrop-blur-md">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate max-w-[180px] sm:max-w-none">{prospectInfo.name}</span>
                  </div>
                </div>
              )}
              <SettingsButton onClick={() => setIsSettingsOpen(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <QualificationProgress />
      
      {/* Load Demo Button */}
      <LoadDemoButton />

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col glass-panel mx-3 sm:mx-4 my-3 sm:my-4 rounded-2xl sm:rounded-3xl overflow-hidden">
          
          {/* Error Banner */}
          {error && (
            <div className="flex-shrink-0 bg-red-900/50 border-b border-red-800 px-4 py-3">
              <div className="flex items-center text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth pb-28 sm:pb-6 scrollbar-thin">
            {messages.map((message, index) => (
              <MessageBubble 
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-[var(--border)] bg-white/5 backdrop-blur-[20px] p-4 sm:p-6 sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                  placeholder="Type your message..."
                  className={`w-full min-h-[44px] glass-input px-4 py-3 placeholder:text-[var(--text-secondary)] ${
                    inputError ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={isTyping}
                />
                {inputError && (
                  <p className="text-red-400 text-xs mt-1 px-2">
                    {inputError}
                  </p>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || !!inputError}
                className="min-h-[44px] min-w-[44px] bg-gradient-to-r from-[#007AFF] to-[#0A84FF] hover:from-[#0A84FF] hover:to-[#5AC8FA] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-3 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isTyping}
                  className="min-h-[44px] text-xs sm:text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 text-[var(--text-secondary)] hover:text-white px-3 sm:px-4 py-2.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-[20px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      {/* Confetti celebration */}
      <ConfettiCelebration />
      
      {/* Talk to Sales floating button - appears when qualification score > 75 */}
      <TalkToSalesButton />
    </div>
  );
}

export default App;
