import React from 'react';
import { CheckCircle, Circle, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { useQualificationStatus } from '../../store/chatStore';
import type { QualificationCriterion } from '../../types';

const QualificationStatus: React.FC = () => {
  const qualificationStatus = useQualificationStatus();
  
  const getStatusIcon = (criterion: QualificationCriterion) => {
    const alpha = criterion.confidence;
    switch (criterion.status) {
      case 'qualified':
        return <CheckCircle className="w-4 h-4 text-green-500" style={{ opacity: 0.5 + alpha * 0.5 }} />;
      case 'unqualified':
        return <AlertCircle className="w-4 h-4 text-red-500" style={{ opacity: 0.5 + alpha * 0.5 }} />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getStatusColor = (criterion: QualificationCriterion) => {
    const baseClasses = {
      qualified: 'text-green-700 bg-green-50 border-green-200',
      unqualified: 'text-red-700 bg-red-50 border-red-200',
      unknown: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    
    return baseClasses[criterion.status];
  };
  
  const getStatusText = (criterion: QualificationCriterion) => {
    switch (criterion.status) {
      case 'qualified':
        return `Qualified ${criterion.confidence > 0 ? `(${Math.round(criterion.confidence * 100)}%)` : ''}`;
      case 'unqualified':
        return `Not Qualified ${criterion.confidence > 0 ? `(${Math.round(criterion.confidence * 100)}%)` : ''}`;
      default:
        return 'Unknown';
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100 border-emerald-300';
    if (score >= 75) return 'text-green-600 bg-green-100 border-green-300';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    if (score > 0) return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-gray-600 bg-gray-100 border-gray-300';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Fit';
    if (score >= 75) return 'Highly Qualified';
    if (score >= 50) return 'Partially Qualified';
    if (score > 0) return 'Under Qualified';
    return 'Not Assessed';
  };
  
  const criteriaArray = Object.values(qualificationStatus.criteria);
  const hasAiAssessment = qualificationStatus.aiAssessment;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">Qualification Status</h3>
          {hasAiAssessment && hasAiAssessment.confidence > 0.7 && (
            <Sparkles className="w-4 h-4 text-purple-500" />
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(qualificationStatus.score)}`}>
          {qualificationStatus.score}%
        </div>
      </div>
      
      {/* Overall Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Overall Score</span>
          </span>
          <span className="font-medium">{getScoreLabel(qualificationStatus.score)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              qualificationStatus.score >= 90
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                : qualificationStatus.score >= 75
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : qualificationStatus.score >= 50
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                : qualificationStatus.score > 0
                ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                : 'bg-gray-400'
            }`}
            style={{ width: `${Math.max(qualificationStatus.score, 5)}%` }}
          />
        </div>
      </div>
      
      {/* Qualification Criteria */}
      <div className="space-y-3">
        {criteriaArray.map((criterion) => {
          return (
            <div key={criterion.id} className={`p-3 rounded-lg border ${getStatusColor(criterion)}`}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getStatusIcon(criterion)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{criterion.name}</span>
                    <div className="text-xs font-medium">
                      {getStatusText(criterion)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
                  
                  {/* Evidence */}
                  {criterion.evidence && criterion.evidence.length > 0 && (
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          Evidence ({criterion.evidence.length})
                        </summary>
                        <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                          {criterion.evidence.slice(0, 2).map((evidence, idx) => (
                            <li key={idx} className="truncate">
                              "{evidence.substring(0, 80)}{evidence.length > 80 ? '...' : ''}"
                            </li>
                          ))}
                          {criterion.evidence.length > 2 && (
                            <li className="text-gray-500">... and {criterion.evidence.length - 2} more</li>
                          )}
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* AI Assessment Summary */}
      {hasAiAssessment && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">AI Assessment</span>
            <span className="text-xs text-purple-600">
              ({Math.round(hasAiAssessment.confidence * 100)}% confidence)
            </span>
          </div>
          <p className="text-sm text-purple-800">{hasAiAssessment.summary}</p>
        </div>
      )}
      
      {/* Ready to Connect */}
      {qualificationStatus.readyToConnect && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              🎉 Ready to Connect!
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            You're a great fit! Our team is excited to speak with you.
          </p>
        </div>
      )}
      
      {/* Notes */}
      {qualificationStatus.notes && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">📝 Notes</h4>
          <p className="text-xs text-blue-800">{qualificationStatus.notes}</p>
        </div>
      )}
      
      {/* Next Questions Suggestions */}
      {hasAiAssessment && hasAiAssessment.nextQuestions && hasAiAssessment.nextQuestions.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Suggested Questions:</h4>
          <ul className="text-xs text-yellow-800 space-y-1">
            {hasAiAssessment.nextQuestions.map((question, idx) => (
              <li key={idx}>• {question}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Last Updated */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Last updated: {qualificationStatus.lastUpdated.toLocaleTimeString()}</span>
        <span>{qualificationStatus.schemaId}</span>
      </div>
    </div>
  );
};

export default QualificationStatus;