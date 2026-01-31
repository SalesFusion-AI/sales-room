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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SalesFusion AI</h1>
                <p className="text-sm text-gray-600">Your Sales Automation Assistant</p>
              </div>
            </div>
            
            {/* Subtle progress indicator */}
            {prospectInfo.name && (
              <div className="flex items-center space-x-4 text-sm">
                {prospectInfo.name && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    {prospectInfo.name}
                  </div>
                )}
                {isQualified && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Qualified
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Connect Option */}
          {showConnect && (
            <div className="border-t bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Ready to connect with our team?</p>
                    <p className="text-xs text-green-600">Schedule a personalized demo</p>
                  </div>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Book Demo
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center"
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
                  className="text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-full border border-gray-200 transition-colors"
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