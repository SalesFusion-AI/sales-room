import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Calendar, User, CheckCircle } from 'lucide-react';
import { useDemoStore, useMessages, useIsTyping, useProspectInfo, useQualificationStatus } from './store/demoStore';

function App() {
  const { addMessage } = useDemoStore();
  const messages = useMessages();
  const isTyping = useIsTyping();
  const prospectInfo = useProspectInfo();
  const { isQualified, showConnect } = useQualificationStatus();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'user');
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">SalesFusion AI</h1>
                <p className="text-sm text-gray-400">Your Sales Automation Assistant</p>
              </div>
            </div>
            
            {/* Subtle progress indicator */}
            {prospectInfo.name && (
              <div className="flex items-center space-x-4 text-sm">
                {prospectInfo.name && (
                  <div className="flex items-center text-gray-300 bg-gray-800 px-3 py-1.5 rounded-full">
                    <User className="h-4 w-4 mr-2" />
                    {prospectInfo.name}
                  </div>
                )}
                {isQualified && (
                  <div className="flex items-center text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Qualified
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Container - Fixed Height */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col bg-gray-950 mx-4 my-4 rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
          
          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-5 py-4 rounded-3xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
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
                <div className="bg-gray-800 border border-gray-700 rounded-3xl px-5 py-4 shadow-lg">
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

          {/* Connect Option */}
          {showConnect && (
            <div className="flex-shrink-0 border-t border-gray-800 bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-300">Ready to connect with our team?</p>
                    <p className="text-xs text-green-400">Schedule a personalized demo</p>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Book Demo
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-2xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                'Hi, I\'m John from TechFlow Solutions',
                'What makes your platform different?',
                'I need to automate our sales process',
                'Tell me about pricing',
                'I\'m a sales manager looking for efficiency'
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInputMessage(prompt);
                    setTimeout(() => {
                      if (prompt === inputMessage) handleSendMessage();
                    }, 100);
                  }}
                  className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;