import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-gray-600" />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-xs">
        <div className="typing-indicator">
          <div className="typing-dot animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="typing-dot animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="typing-dot animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          AI is typing...
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;