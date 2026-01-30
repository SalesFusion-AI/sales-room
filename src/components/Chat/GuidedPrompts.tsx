import React from 'react';
import { MessageSquare, DollarSign, Zap, HelpCircle, Building, Calendar } from 'lucide-react';
import { GuidedPrompt } from '../../types';

interface GuidedPromptsProps {
  onPromptClick: (promptText: string) => void;
  className?: string;
}

// Default guided prompts - these would be customizable per client
const DEFAULT_PROMPTS: GuidedPrompt[] = [
  {
    id: '1',
    text: "What problems does your solution solve?",
    category: 'product',
    priority: 1,
  },
  {
    id: '2', 
    text: "How much does it cost?",
    category: 'pricing',
    priority: 2,
  },
  {
    id: '3',
    text: "Can I see a demo?",
    category: 'process',
    priority: 3,
  },
  {
    id: '4',
    text: "How long does implementation take?",
    category: 'process',
    priority: 4,
  },
  {
    id: '5',
    text: "What makes you different from competitors?",
    category: 'product',
    priority: 5,
  },
  {
    id: '6',
    text: "Do you have case studies or success stories?",
    category: 'product',
    priority: 6,
  },
];

const GuidedPrompts: React.FC<GuidedPromptsProps> = ({ 
  onPromptClick, 
  className = '' 
}) => {
  const getIconForCategory = (category: GuidedPrompt['category']) => {
    switch (category) {
      case 'product':
        return <Zap className="w-4 h-4" />;
      case 'pricing':
        return <DollarSign className="w-4 h-4" />;
      case 'process':
        return <Calendar className="w-4 h-4" />;
      case 'intro':
        return <MessageSquare className="w-4 h-4" />;
      case 'objection':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };
  
  const getCategoryColor = (category: GuidedPrompt['category']) => {
    switch (category) {
      case 'product':
        return 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'pricing':
        return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100';
      case 'process':
        return 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'intro':
        return 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100';
      case 'objection':
        return 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };
  
  return (
    <div className={`p-4 border-t border-gray-100 bg-gray-50 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          Popular questions
        </h3>
        <p className="text-xs text-gray-600">
          Click any question below to get started, or type your own message
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DEFAULT_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onPromptClick(prompt.text)}
            className={`
              guided-prompt text-left transition-all duration-200 group
              ${getCategoryColor(prompt.category)}
            `}
          >
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {getIconForCategory(prompt.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate group-hover:text-current">
                  {prompt.text}
                </div>
                {prompt.context && (
                  <div className="text-xs opacity-75 mt-1 truncate">
                    {prompt.context}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-center">
        <button
          onClick={() => onPromptClick("I'd like to learn more about your solution")}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          Or tell me more about your solution →
        </button>
      </div>
    </div>
  );
};

export default GuidedPrompts;