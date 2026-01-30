import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  
  const getMessageTypeIcon = () => {
    if (!message.metadata?.type) return null;
    
    switch (message.metadata.type) {
      case 'qualification':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'objection':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'question':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };
  
  if (isUser) {
    return (
      <div className="flex justify-end items-start space-x-3 animate-slide-up">
        <div className="flex flex-col items-end max-w-xs lg:max-w-md">
          <div className="chat-message-user">
            <div className="text-sm font-medium">{message.content}</div>
            {message.metadata?.type && (
              <div className="flex items-center space-x-1 mt-1 opacity-80">
                {getMessageTypeIcon()}
                <span className="text-xs capitalize">{message.metadata.type}</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatTime(message.timestamp)}
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }
  
  if (isAssistant) {
    return (
      <div className="flex items-start space-x-3 animate-slide-up">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex flex-col max-w-xs lg:max-w-md">
          <div className="chat-message-ai">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-sm text-gray-900 mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                  ul: ({ children }) => <ul className="text-sm text-gray-900 space-y-1 pl-4">{children}</ul>,
                  ol: ({ children }) => <ol className="text-sm text-gray-900 space-y-1 pl-4">{children}</ol>,
                  li: ({ children }) => <li className="list-disc">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            
            {/* Message metadata */}
            {message.metadata && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {message.metadata.type && (
                  <div className="flex items-center space-x-1 mb-1">
                    {getMessageTypeIcon()}
                    <span className="text-xs text-gray-600 capitalize">
                      {message.metadata.type}
                    </span>
                    {message.metadata.confidence && (
                      <span className="text-xs text-gray-500">
                        ({Math.round(message.metadata.confidence * 100)}% confident)
                      </span>
                    )}
                  </div>
                )}
                
                {message.metadata.sources && message.metadata.sources.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Sources: </span>
                    {message.metadata.sources.join(', ')}
                  </div>
                )}
                
                {message.metadata.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 font-medium mb-1">Suggested actions:</div>
                    <div className="flex flex-wrap gap-1">
                      {message.metadata.suggestedActions.map((action, index) => (
                        <button
                          key={index}
                          className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full hover:bg-primary-100 transition-colors"
                          onClick={() => {
                            // Handle suggested action click
                            console.log('Suggested action clicked:', action);
                          }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default MessageBubble;