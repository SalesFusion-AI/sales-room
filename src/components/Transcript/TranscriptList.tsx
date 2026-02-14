import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  MessageSquare,
  ExternalLink,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
  Building,
  Mail,
} from 'lucide-react';
import { transcriptService, type StoredConversation, type LeadTag } from '../../services/transcriptService';
import { crmService } from '../../services/crmService';
import TranscriptViewer from './TranscriptViewer';

interface TranscriptListProps {
  onConversationSelect?: (conversation: StoredConversation) => void;
  showViewer?: boolean;
}

type SortBy = 'date' | 'score' | 'messages' | 'duration';
type FilterBy = 'all' | 'hot' | 'warm' | 'cold' | 'ready' | 'unsynced';

const TranscriptList: React.FC<TranscriptListProps> = ({
  onConversationSelect,
  showViewer = true
}) => {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<StoredConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<StoredConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Filter and sort conversations
  useEffect(() => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchTerm) {
      filtered = transcriptService.searchTranscripts(searchTerm);
    }

    // Apply tag/status filter
    switch (filterBy) {
      case 'hot':
        filtered = filtered.filter(c => c.tags.some(tag => tag.id === 'hot'));
        break;
      case 'warm':
        filtered = filtered.filter(c => c.tags.some(tag => tag.id === 'warm'));
        break;
      case 'cold':
        filtered = filtered.filter(c => c.tags.some(tag => tag.id === 'cold'));
        break;
      case 'ready':
        filtered = filtered.filter(c => c.qualificationStatus.readyToConnect);
        break;
      case 'unsynced':
        filtered = filtered.filter(c => !c.crmSynced);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        case 'score':
          return b.qualificationStatus.score - a.qualificationStatus.score;
        case 'messages':
          return b.messages.length - a.messages.length;
        case 'duration':
          return (b.updatedAt.getTime() - b.createdAt.getTime()) - 
                 (a.updatedAt.getTime() - a.createdAt.getTime());
        default:
          return 0;
      }
    });

    setFilteredConversations(filtered);
  }, [conversations, searchTerm, sortBy, filterBy]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const stored = transcriptService.getStoredTranscripts();
      setConversations(stored);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation: StoredConversation) => {
    setSelectedConversation(conversation);
    onConversationSelect?.(conversation);
  };

  const handleSyncToCRM = async (conversation: StoredConversation) => {
    setSyncing(prev => new Set(prev).add(conversation.sessionId));
    
    try {
      // Generate summary if not exists
      let summary = transcriptService.getSummary(conversation.sessionId);
      if (!summary) {
        summary = await transcriptService.generateSummary(conversation);
      }
      
      // Sync to CRM
      const result = await crmService.syncConversation(conversation, summary);
      
      if (result.success) {
        // Update conversation as synced
        const updatedConversation = {
          ...conversation,
          crmSynced: true,
          crmId: result.crmId
        };
        
        await transcriptService.storeConversation(updatedConversation);
        loadConversations(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to sync to CRM:', error);
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(conversation.sessionId);
        return newSet;
      });
    }
  };

  const getTagColor = (tag: LeadTag): string => {
    const colors: Record<string, string> = {
      hot: 'bg-red-100 text-red-800 border-red-200',
      warm: 'bg-amber-100 text-amber-800 border-amber-200',
      cold: 'bg-gray-100 text-gray-800 border-gray-200',
      enterprise: 'bg-purple-100 text-purple-800 border-purple-200',
      urgent: 'bg-red-100 text-red-900 border-red-300'
    };
    return colors[tag.id] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const analytics = transcriptService.getAnalytics();

  if (selectedConversation && showViewer) {
    return (
      <TranscriptViewer
        conversation={selectedConversation}
        onClose={() => setSelectedConversation(null)}
        showActions={true}
        showSummary={true}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conversation Transcripts</h1>
            <p className="text-gray-600">Review and manage sales conversations</p>
          </div>
          <button
            onClick={loadConversations}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalConversations}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.hotLeads}</p>
                <p className="text-sm text-gray-600">Hot Leads</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-amber-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.warmLeads}</p>
                <p className="text-sm text-gray-600">Warm Leads</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgQualificationScore}%</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <ExternalLink className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.crmSyncedCount}</p>
                <p className="text-sm text-gray-600">CRM Synced</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations, prospects, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex space-x-2">
            {(['all', 'hot', 'warm', 'cold', 'ready', 'unsynced'] as FilterBy[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterBy === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === 'ready' && ` (${analytics.hotLeads + analytics.warmLeads})`}
                {filter === 'unsynced' && ` (${analytics.totalConversations - analytics.crmSyncedCount})`}
              </button>
            ))}
          </div>

          {/* Sort & Filter Toggle */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="messages">Sort by Messages</option>
              <option value="duration">Sort by Duration</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Time</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Scores</option>
                  <option>80-100%</option>
                  <option>60-79%</option>
                  <option>0-59%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Count</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Any Length</option>
                  <option>10+ Messages</option>
                  <option>5-9 Messages</option>
                  <option>1-4 Messages</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CRM Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All</option>
                  <option>Synced</option>
                  <option>Not Synced</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredConversations.length} of {conversations.length} conversations
        </p>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || filterBy !== 'all' 
                ? 'No conversations match your filters'
                : 'No conversations yet'
              }
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.sessionId}
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => handleConversationClick(conversation)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {conversation.prospect.name || 'Anonymous Prospect'}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(conversation.qualificationStatus.score)}`}>
                        {conversation.qualificationStatus.score}% qualified
                      </div>
                      {conversation.qualificationStatus.readyToConnect && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Ready to Connect
                        </span>
                      )}
                    </div>

                    {/* Prospect Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      {conversation.prospect.company && (
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{conversation.prospect.company}</span>
                        </div>
                      )}
                      {conversation.prospect.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{conversation.prospect.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(conversation.lastActivity)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{conversation.messages.length} messages</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {conversation.tags.map(tag => (
                        <span
                          key={tag.id}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    {/* Last Message Preview */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Last message:</span>
                      {' '}
                      {conversation.messages[conversation.messages.length - 1]?.content.substring(0, 100)}
                      {conversation.messages[conversation.messages.length - 1]?.content.length > 100 && '...'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConversationClick(conversation);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {!conversation.crmSynced && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSyncToCRM(conversation);
                          }}
                          disabled={syncing.has(conversation.sessionId)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                          title="Sync to CRM"
                        >
                          {syncing.has(conversation.sessionId) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      {conversation.crmSynced && (
                        <div className="p-2 text-green-600" title="Synced to CRM">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      ID: {conversation.sessionId.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptList;