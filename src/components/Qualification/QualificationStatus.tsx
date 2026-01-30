import React from 'react';
import { CheckCircle, Circle, AlertCircle, DollarSign, Crown, Clock, Target } from 'lucide-react';
import { useQualificationStatus } from '../../store/chatStore';
import { QualificationStatus as QualificationStatusType } from '../../types';

const QualificationStatus: React.FC = () => {
  const qualificationStatus = useQualificationStatus();
  
  const getStatusIcon = (status: QualificationStatusType['budget']) => {
    switch (status) {
      case 'qualified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unqualified':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getStatusColor = (status: QualificationStatusType['budget']) => {
    switch (status) {
      case 'qualified':
        return 'text-green-700 bg-green-50';
      case 'unqualified':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getStatusText = (status: QualificationStatusType['budget']) => {
    switch (status) {
      case 'qualified':
        return 'Qualified';
      case 'unqualified':
        return 'Not Qualified';
      default:
        return 'Unknown';
    }
  };
  
  const qualificationItems = [
    {
      key: 'budget' as const,
      label: 'Budget',
      icon: DollarSign,
      description: 'Has budget allocated',
    },
    {
      key: 'authority' as const,
      label: 'Authority',
      icon: Crown,
      description: 'Decision making power',
    },
    {
      key: 'need' as const,
      label: 'Need',
      icon: Target,
      description: 'Clear business need',
    },
    {
      key: 'timeline' as const,
      label: 'Timeline',
      icon: Clock,
      description: 'Defined timeframe',
    },
  ];
  
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Highly Qualified';
    if (score >= 50) return 'Partially Qualified';
    if (score > 0) return 'Under Qualified';
    return 'Not Assessed';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Qualification Status</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(qualificationStatus.score)}`}>
          {qualificationStatus.score}%
        </div>
      </div>
      
      {/* Overall Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall Score</span>
          <span className="font-medium">{getScoreLabel(qualificationStatus.score)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              qualificationStatus.score >= 75
                ? 'bg-green-500'
                : qualificationStatus.score >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${qualificationStatus.score}%` }}
          />
        </div>
      </div>
      
      {/* BANT Criteria */}
      <div className="space-y-3">
        {qualificationItems.map((item) => {
          const status = qualificationStatus[item.key];
          const Icon = item.icon;
          
          return (
            <div key={item.key} className="flex items-center space-x-3 p-2 rounded-lg border border-gray-100">
              <div className="flex-shrink-0">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Icon className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                </div>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {getStatusText(status)}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Ready to Connect */}
      {qualificationStatus.readyToConnect && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Ready to Connect!
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Based on your responses, you're a great fit for our solution.
          </p>
        </div>
      )}
      
      {/* Notes */}
      {qualificationStatus.notes && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Notes</h4>
          <p className="text-xs text-blue-800">{qualificationStatus.notes}</p>
        </div>
      )}
      
      {/* Helpful Tips */}
      {qualificationStatus.score < 75 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-1">💡 To improve your qualification:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {qualificationStatus.budget === 'unknown' && (
              <li>• Share information about your budget or timeline</li>
            )}
            {qualificationStatus.authority === 'unknown' && (
              <li>• Let me know your role in the decision-making process</li>
            )}
            {qualificationStatus.need === 'unknown' && (
              <li>• Describe the business challenges you're trying to solve</li>
            )}
            {qualificationStatus.timeline === 'unknown' && (
              <li>• Mention when you're looking to implement a solution</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QualificationStatus;