import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  MessageSquare,
  Phone,
  Target,
  Users,
  Calendar,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { demoService } from '../../demo/demoService';
import { transcriptService } from '../../services/transcriptService';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface WeeklyTrend {
  week: string;
  conversations: number;
  qualified: number;
  booked: number;
}

interface TopIndustry {
  name: string;
  percentage: number;
  count: number;
}

interface AnalyticsData {
  conversationsStarted?: number;
  totalConversations: number;
  qualificationRate?: number;
  callsBooked?: number;
  averageQualificationScore?: number;
  avgQualificationScore?: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  weeklyTrends?: WeeklyTrend[];
  topIndustries?: TopIndustry[];
  conversionRate?: number;
  averageSessionDuration?: number;
  averageMessagesPerSession?: number;
  avgMessageCount?: number;
  crmSyncedCount: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Try to load demo analytics first
      let analyticsData;
      if (demoService.isDemoActive()) {
        analyticsData = demoService.getDemoAnalytics();
      } else {
        // Load real analytics
        analyticsData = transcriptService.getAnalytics();
      }
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg border h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-lg border h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No analytics data available</p>
          <p className="text-sm text-gray-500 mt-2">
            Start conversations to see performance metrics
          </p>
        </div>
      </div>
    );
  }

  const metrics: MetricCard[] = [
    {
      title: 'Conversations Started',
      value: analytics.conversationsStarted || analytics.totalConversations || 0,
      change: +23,
      changeLabel: 'vs last month',
      icon: MessageSquare,
      color: 'blue',
      description: 'Total conversations initiated by prospects'
    },
    {
      title: 'Qualification Rate', 
      value: `${analytics.qualificationRate || (analytics.totalConversations > 0 ? Math.round((analytics.hotLeads + analytics.warmLeads) / analytics.totalConversations * 100) : 0)}%`,
      change: +12,
      changeLabel: 'vs last month',
      icon: Target,
      color: 'green',
      description: 'Percentage of conversations that qualify as leads'
    },
    {
      title: 'Calls Booked',
      value: analytics.callsBooked || 0,
      change: +8,
      changeLabel: 'vs last month', 
      icon: Phone,
      color: 'purple',
      description: 'Qualified leads that scheduled sales calls'
    },
    {
      title: 'Avg. Qualification Score',
      value: `${analytics.averageQualificationScore || analytics.avgQualificationScore || 0}%`,
      change: +5,
      changeLabel: 'vs last month',
      icon: Star,
      color: 'amber',
      description: 'Average BANT qualification score across all conversations'
    }
  ];

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200', 
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      amber: 'text-amber-600 bg-amber-50 border-amber-200',
      red: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600', 
      amber: 'text-amber-600',
      red: 'text-red-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your sales room performance and conversion metrics</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Mode Indicator */}
      {demoService.isDemoActive() && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Demo Mode Active</span>
          </div>
          <p className="text-sm opacity-90 mt-1">
            Showing sample data for presentation. Real analytics will replace this in production.
          </p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${getMetricColor(metric.color)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${getIconColor(metric.color)}`} />
                {metric.change && (
                  <div className="flex items-center text-sm">
                    {metric.change > 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
                {metric.change && metric.changeLabel && (
                  <p className="text-xs text-gray-500">{metric.changeLabel}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lead Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Lead Distribution</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Hot Leads</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{analytics.hotLeads || 0}</p>
                <p className="text-xs text-gray-500">85%+ score</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Warm Leads</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{analytics.warmLeads || 0}</p>
                <p className="text-xs text-gray-500">60-84% score</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Cold Leads</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{analytics.coldLeads || 0}</p>
                <p className="text-xs text-gray-500">&lt;60% score</p>
              </div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-4 space-y-2">
            {[
              { label: 'Hot', value: analytics.hotLeads || 0, color: 'bg-red-500' },
              { label: 'Warm', value: analytics.warmLeads || 0, color: 'bg-amber-500' },
              { label: 'Cold', value: analytics.coldLeads || 0, color: 'bg-gray-400' }
            ].map((item) => {
              const total = (analytics.hotLeads || 0) + (analytics.warmLeads || 0) + (analytics.coldLeads || 0);
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              
              return (
                <div key={item.label} className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          {analytics.weeklyTrends && (
            <div className="space-y-4">
              {analytics.weeklyTrends.map((week, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{week.week}</span>
                    <span className="text-gray-500">{week.conversations} conversations</span>
                  </div>
                  
                  <div className="space-y-1">
                    {/* Conversations bar */}
                    <div className="flex items-center space-x-2">
                      <div className="w-16 text-xs text-gray-500">Total</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(week.conversations / 100) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-xs text-gray-700">{week.conversations}</div>
                    </div>
                    
                    {/* Qualified bar */}
                    <div className="flex items-center space-x-2">
                      <div className="w-16 text-xs text-gray-500">Qualified</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${week.conversations > 0 ? (week.qualified / week.conversations) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-xs text-gray-700">{week.qualified}</div>
                    </div>
                    
                    {/* Booked bar */}
                    <div className="flex items-center space-x-2">
                      <div className="w-16 text-xs text-gray-500">Booked</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${week.qualified > 0 ? (week.booked / week.qualified) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-xs text-gray-700">{week.booked}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Industry Breakdown & Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Industries */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Industries</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          {analytics.topIndustries && (
            <div className="space-y-3">
              {analytics.topIndustries.map((industry, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{industry.name}</span>
                    <span className="text-gray-500">{industry.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${industry.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">{industry.count} conversations</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  {analytics.conversionRate || '0.0'}%
                </span>
              </div>
              <p className="text-xs text-gray-500">Conversations to calls</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avg. Session Duration</span>
                <span className="text-lg font-bold text-gray-900">
                  {analytics.averageSessionDuration || '0.0'}m
                </span>
              </div>
              <p className="text-xs text-gray-500">Time spent per conversation</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avg. Messages</span>
                <span className="text-lg font-bold text-gray-900">
                  {analytics.averageMessagesPerSession || analytics.avgMessageCount || '0.0'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Messages per conversation</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">CRM Synced</span>
                <span className="text-lg font-bold text-gray-900">
                  {analytics.crmSyncedCount || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500">Conversations synced to CRM</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <ExternalLink className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>View All Transcripts</span>
            </button>
            
            <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Hot Leads to Call</span>
            </button>
            
            <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Sync to CRM</span>
            </button>
            
            <button className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;