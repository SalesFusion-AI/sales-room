import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, User, AlertCircle } from 'lucide-react';
import { useChatStore, useMessages, useIsTyping, useProspectInfo, useError } from './store/chatStore';
import TalkToSalesButton from './components/TalkToSales/TalkToSalesButton';
import SettingsButton from './components/Settings/SettingsButton';
import SettingsPanel from './components/Settings/SettingsPanel';

function App() {
  const sendUserMessage = useChatStore(s => s.sendUserMessage);
  const messages = useMessages();
  const isTyping = useIsTyping();
  const prospectInfo = useProspectInfo();
  const error = useError();
  const [inputMessage, setInputMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isTyping) {
      const message = inputMessage;
      setInputMessage('');
      await sendUserMessage(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (!isTyping) {
      setInputMessage('');
      sendUserMessage(prompt);
    }
  };

  return (
    <div className="min-h-screen h-[100svh] bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-white truncate">SalesFusion AI</h1>
                <p className="text-xs sm:text-sm text-gray-400">Your Sales Automation Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Prospect info indicator */}
              {prospectInfo.name && (
                <div className="flex items-center text-xs sm:text-sm">
                  <div className="flex items-center text-gray-300 bg-gray-800 px-3 py-2 rounded-full">
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

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col bg-gray-950 mx-3 sm:mx-4 my-3 sm:my-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
          
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth pb-28 sm:pb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-sm md:max-w-md px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3.5 sm:py-4 shadow-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/70 backdrop-blur-sm p-4 sm:p-6 sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                placeholder="Type your message..."
                className="flex-1 min-h-[44px] bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="min-h-[44px] min-w-[44px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-3 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "What does SalesFusion do?",
                "How does the AI work?",
                "Tell me about pricing",
                "I want to automate my sales",
                "Book a demo"
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isTyping}
                  className="min-h-[44px] text-xs sm:text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 hover:text-white px-3 sm:px-4 py-2.5 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200"
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
    </div>
  );
}

export default App;
