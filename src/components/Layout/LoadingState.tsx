import React from 'react';
import { Loader2, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  type?: 'default' | 'conversation' | 'analytics' | 'ai';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = 'default', 
  message,
  showProgress = false,
  progress = 0
}) => {
  const getIcon = () => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="w-8 h-8 text-blue-600" />;
      case 'analytics':
        return <TrendingUp className="w-8 h-8 text-green-600" />;
      case 'ai':
        return <Sparkles className="w-8 h-8 text-purple-600" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-600" />;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'conversation':
        return 'Loading conversations...';
      case 'analytics':
        return 'Analyzing performance data...';
      case 'ai':
        return 'AI is thinking...';
      default:
        return 'Loading...';
    }
  };

  const getSubMessage = () => {
    switch (type) {
      case 'conversation':
        return 'Fetching your conversation history';
      case 'analytics':
        return 'Calculating metrics and insights';
      case 'ai':
        return 'Processing your request with AI';
      default:
        return 'Please wait a moment';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-64 p-8">
      <div className="flex items-center justify-center mb-4">
        {type === 'default' ? (
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        ) : (
          <div className="relative">
            {getIcon()}
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {getMessage()}
      </h3>
      
      <p className="text-sm text-gray-600 text-center mb-4">
        {getSubMessage()}
      </p>

      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Animated dots for visual interest */}
      <div className="flex space-x-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
            style={{ 
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;