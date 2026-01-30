import React, { useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore, useMessages, useIsTyping } from '../../store/chatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import GuidedPrompts from './GuidedPrompts';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const messages = useMessages();
  const isTyping = useIsTyping();
  const { addMessage, setTyping } = useChatStore();
  
  const [inputValue, setInputValue] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSubmitting(true);
    
    // Add user message
    addMessage(userMessage, 'user');
    
    // Show typing indicator
    setTyping(true);
    
    try {
      // Simulate AI response (will be replaced with actual AI integration)
      await simulateAIResponse(userMessage);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      addMessage('I apologize, but I\'m having trouble responding right now. Please try again.', 'assistant');
    } finally {
      setTyping(false);
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handlePromptClick = (promptText: string) => {
    setInputValue(promptText);
    textareaRef.current?.focus();
  };
  
  // Temporary AI simulation - will be replaced with actual AI integration
  const simulateAIResponse = async (userMessage: string): Promise<void> => {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple response generation (will be replaced with actual AI)
    let response = getSimulatedResponse(userMessage);
    
    addMessage(response, 'assistant', {
      type: 'general',
      confidence: 0.85,
    });
  };
  
  const getSimulatedResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
      return "Great question about pricing! Our solution is designed to provide exceptional ROI. We have several plans to fit different business sizes and needs. Would you like me to share some pricing information, or would you prefer to discuss your specific requirements first so I can recommend the best option?";
    }
    
    if (lowerMessage.includes('demo') || lowerMessage.includes('show me') || lowerMessage.includes('see it')) {
      return "I'd love to show you how our solution works! A personalized demo is the best way to see the value for your specific situation. Would you like to schedule a quick 15-minute demo, or do you have some specific questions I can answer first?";
    }
    
    if (lowerMessage.includes('company') || lowerMessage.includes('business') || lowerMessage.includes('we are')) {
      return "Tell me more about your company! Understanding your business helps me provide the most relevant information. What industry are you in, and what's your biggest challenge right now that brought you here?";
    }
    
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return "Great question! Our solution works by [key process/benefit]. The typical result our clients see is [specific outcome]. Would you like me to walk you through a specific use case that might be relevant to your situation?";
    }
    
    // Default response
    return "That's a great point! I'd love to help you with that. Can you tell me a bit more about your specific situation so I can give you the most helpful information?";
  };
  
  const shouldShowGuidedPrompts = messages.length === 0;
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.946-1.524A11.973 11.973 0 015.2 21 11.966 11.966 0 015 19.197c-1.39-2.48-1.39-5.914 0-8.395 0-.375.03-.72.085-1.024C7.54 7.11 9.728 5 12.5 5s5.04 2.11 7.415 4.777z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Hi! I'm here to help 👋
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Ask me anything about our solution, pricing, or how we can help your business grow.
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Guided Prompts */}
      {shouldShowGuidedPrompts && (
        <GuidedPrompts onPromptClick={handlePromptClick} />
      )}
      
      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="chat-input min-h-[44px] max-h-32 pr-12"
              rows={1}
              disabled={isSubmitting}
            />
            {inputValue.trim() && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-2 bottom-2 p-2 text-primary-600 hover:text-primary-700 disabled:text-gray-400"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;