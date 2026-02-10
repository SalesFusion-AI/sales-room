import { useState } from 'react';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
  isLatest?: boolean;
}

const MessageBubble = ({ message, isLatest = false }: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
        isLatest ? 'animate-in slide-in-from-bottom-4 duration-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-sm md:max-w-md">
        {/* Avatar for assistant */}
        {message.role === 'assistant' && (
          <div className={`flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center transition-transform duration-200 ${
            isHovered ? 'scale-110' : ''
          }`}>
            <Bot className="h-4 w-4 text-white" />
          </div>
        )}
        
        <div
          className={`relative px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg transition-all duration-300 ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-[#007AFF] via-[#0A84FF] to-[#5AC8FA] text-white shadow-[0_8px_32px_rgba(0,122,255,0.3)] hover:shadow-[0_12px_40px_rgba(0,122,255,0.4)]'
              : 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] text-white border border-white/20 backdrop-blur-[40px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:border-white/30'
          } ${isHovered ? 'scale-105' : ''}`}
        >
          {/* Message content */}
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Timestamp */}
          <p className={`text-xs mt-2 transition-opacity duration-200 ${
            message.role === 'user' ? 'text-blue-100/80' : 'text-[var(--text-secondary)]'
          } ${isHovered ? 'opacity-100' : 'opacity-70'}`}>
            {message.timestamp.toLocaleTimeString()}
          </p>
          
          {/* Subtle glow effect on hover */}
          {message.role === 'user' && (
            <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-white/10 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          )}
        </div>
        
        {/* Avatar for user */}
        {message.role === 'user' && (
          <div className={`flex-shrink-0 h-8 w-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center transition-transform duration-200 ${
            isHovered ? 'scale-110' : ''
          }`}>
            <User className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;