import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Bot, 
  Search, 
  Filter, 
  Download, 
  Share, 
  Star,
  MessageSquare,
  Calendar,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import type { StoredConversation, TranscriptSummary } from '../../types';
import { transcriptService } from '../../services/transcriptService';

interface TranscriptViewerProps {
  sessionId?: string;
  conversation?: StoredConversation;
  onClose?: () => void;
  showActions?: boolean;
  showSummary?: boolean;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  sessionId,
  conversation: providedConversation,
  onClose,
  showActions = true,
  showSummary = true
}) => {
  const [conversation, setConversation] = useState<StoredConversation | null>(providedConversation || null);
  const [summary, setSummary] = useState<TranscriptSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedMessages, setHighlightedMessages] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['messages', 'summary']));
  const [loading, setLoading] = useState(false);

  // Load conversation if sessionId provided
  useEffect(() => {
    if (sessionId && !providedConversation) {
      const storedConversation = transcriptService.getConversationBySessionId(sessionId);
      if (storedConversation) {
        setConversation(storedConversation);
        
        // Load or generate summary
        const existingSummary = transcriptService.getSummary(sessionId);
        if (!existingSummary) {
          setLoading(true);
          transcriptService.generateSummary(storedConversation).then(newSummary => {
            setSummary(newSummary);
            setLoading(false);
          });
        } else {
          setSummary(existingSummary);
        }
      }
    } else if (providedConversation) {
      setConversation(providedConversation);
      // Load summary if exists
      const existingSummary = transcriptService.getSummary(providedConversation.sessionId);
      if (existingSummary) {
        setSummary(existingSummary);
      }
    }
  }, [sessionId, providedConversation]);

  // Handle search
  useEffect(() => {
    if (!searchTerm || !conversation) {
      setHighlightedMessages(new Set());
      return;
    }

    const highlighted = new Set<string>();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    conversation.messages.forEach(message => {
      if (message.content.toLowerCase().includes(lowerSearchTerm)) {
        highlighted.add(message.id);
      }
    });
    
    setHighlightedMessages(highlighted);
  }, [searchTerm, conversation]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleExport = () => {
    if (!conversation) return;
    
    const exportData = {
      conversation,
      summary,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Sales Rep' // Would be actual user info
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMessageIcon = (role: 'user' | 'assistant') => {
    return role === 'user' ? 
      <User className="w-4 h-4 text-blue-600" /> : 
      <Bot className="w-4 h-4 text-purple-600" />;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTagColor = (tagName: string): string => {
    const colors: Record<string, string> = {
      'Hot Lead': 'bg-red-100 text-red-800 border-red-200',
      'Warm Lead': 'bg-amber-100 text-amber-800 border-amber-200',
      'Cold Lead': 'bg-gray-100 text-gray-800 border-gray-200',
      'Enterprise': 'bg-purple-100 text-purple-800 border-purple-200',
      'Urgent': 'bg-red-100 text-red-900 border-red-300'
    };
    return colors[tagName] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getCriterionIcon = (status: string) => {
    switch (status) {
      case 'qualified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unqualified':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-3 sm:mx-4 lg:mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 truncate">
              {conversation.prospect.name || 'Anonymous Prospect'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm opacity-90">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{conversation.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(summary?.duration || 0)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{conversation.messages.length} messages</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>{conversation.qualificationStatus.score}% qualified</span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExport}
                className="min-h-[44px] bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-md flex items-center space-x-1 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="min-h-[44px] bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-md flex items-center space-x-1 transition-colors">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="min-h-[44px] bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {conversation.tags.map(tag => (
            <span
              key={tag.id}
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag.name)} bg-opacity-90`}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:h-[600px]">
        {/* Left Panel - Summary & Info */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-4 space-y-4">
            
            {/* Prospect Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <button
                onClick={() => toggleSection('prospect')}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-semibold text-gray-900">Prospect Information</h3>
                {expandedSections.has('prospect') ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </button>
              
              {expandedSections.has('prospect') && (
                <div className="mt-3 space-y-2 text-sm">
                  {conversation.prospect.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{conversation.prospect.email}</span>
                    </div>
                  )}
                  {conversation.prospect.company && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{conversation.prospect.company}</span>
                    </div>
                  )}
                  {conversation.prospect.title && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{conversation.prospect.title}</span>
                    </div>
                  )}
                  {conversation.prospect.industry && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">{conversation.prospect.industry}</span>
                    </div>
                  )}
                  {conversation.prospect.companySize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{conversation.prospect.companySize}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Qualification Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <button
                onClick={() => toggleSection('qualification')}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-semibold text-gray-900">Qualification</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">
                    {conversation.qualificationStatus.score}%
                  </span>
                  {expandedSections.has('qualification') ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </div>
              </button>

              {expandedSections.has('qualification') && (
                <div className="mt-3 space-y-2">
                  {Object.values(conversation.qualificationStatus.criteria).map(criterion => (
                    <div key={criterion.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getCriterionIcon(criterion.status)}
                        <span className="text-gray-900">{criterion.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        criterion.status === 'qualified' ? 'bg-green-100 text-green-800' :
                        criterion.status === 'unqualified' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {criterion.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Summary */}
            {showSummary && summary && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <button
                  onClick={() => toggleSection('summary')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">AI Summary</h3>
                  </div>
                  {expandedSections.has('summary') ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </button>

                {expandedSections.has('summary') && (
                  <div className="mt-3 space-y-3 text-sm">
                    {summary.keyPoints.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Key Points:</h4>
                        <ul className="text-gray-600 space-y-1">
                          {summary.keyPoints.map((point, idx) => (
                            <li key={idx}>• {point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {summary.painPoints.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Pain Points:</h4>
                        <ul className="text-gray-600 space-y-1">
                          {summary.painPoints.map((point, idx) => (
                            <li key={idx}>• {point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {summary.concerns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Concerns:</h4>
                        <ul className="text-gray-600 space-y-1">
                          {summary.concerns.map((concern, idx) => (
                            <li key={idx}>• {concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Next Steps:</h4>
                      <ul className="text-gray-600 space-y-1">
                        {summary.nextSteps.map((step, idx) => (
                          <li key={idx}>• {step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse mx-auto mb-2" />
                <p className="text-sm text-gray-600">Generating AI summary...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Messages */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {highlightedMessages.size > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Found {highlightedMessages.size} matching messages
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                  highlightedMessages.has(message.id) ? 'bg-yellow-50 p-2 rounded-lg' : ''
                }`}
              >
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {getMessageIcon(message.role)}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.metadata?.confidence && (
                      <span className="text-xs opacity-75">
                        ({Math.round(message.metadata.confidence * 100)}%)
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap break-words">
                    {highlightedMessages.has(message.id) && searchTerm ? 
                      message.content.replace(
                        new RegExp(searchTerm, 'gi'), 
                        `<mark class="bg-yellow-300">$&</mark>`
                      ) : message.content
                    }
                  </div>
                  {message.metadata?.type && (
                    <div className="mt-1 text-xs opacity-75">
                      Type: {message.metadata.type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {showActions && conversation.qualificationStatus.readyToConnect && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  🎉 This prospect is ready to connect!
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-1 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-1 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptViewer;