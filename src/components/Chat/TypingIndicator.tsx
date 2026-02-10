import { Bot, Brain } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-end gap-2">
        {/* AI Avatar */}
        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <Bot className="h-4 w-4 text-white" />
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3.5 sm:py-4 shadow-lg backdrop-blur-[20px] relative overflow-hidden">
          {/* Background shimmer effect */}
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          
          <div className="flex items-center gap-3 relative z-10">
            <Brain className="h-3 w-3 text-blue-400 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">AI is thinking...</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;