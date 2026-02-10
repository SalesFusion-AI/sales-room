import { useMemo } from 'react';
import { CheckCircle, Circle, TrendingUp } from 'lucide-react';
import { useQualificationScore, useChatStore } from '../../store/chatStore';

const QualificationProgress = () => {
  const qualificationScore = useQualificationScore();
  const signals = useChatStore(s => s.demoQualificationSignals);
  
  const progressSteps = useMemo(() => [
    { label: 'Budget', key: 'budget', threshold: 20 },
    { label: 'Timeline', key: 'timeline', threshold: 35 },
    { label: 'Pain Point', key: 'painPoint', threshold: 50 },
    { label: 'Contact Info', key: 'nameCompany', threshold: 60 },
    { label: 'Demo Interest', key: 'demoPricing', threshold: 75 },
  ], []);

  const completedSteps = progressSteps.filter(step => signals[step.key as keyof typeof signals]).length;
  const progressPercent = Math.min((qualificationScore / 100) * 100, 100);

  if (qualificationScore < 10) return null;

  return (
    <div className="mx-4 mb-4">
      <div className="glass-panel rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Qualification Progress</span>
          </div>
          <span className="text-xs text-gray-400">{Math.round(qualificationScore)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-white/10 rounded-full mb-3 overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex justify-between items-center">
          {progressSteps.map((step, index) => {
            const isCompleted = signals[step.key as keyof typeof signals];
            const isActive = qualificationScore >= step.threshold;
            
            return (
              <div 
                key={step.key} 
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div className={`transition-all duration-300 ${
                  isCompleted 
                    ? 'text-green-400' 
                    : isActive 
                      ? 'text-blue-400' 
                      : 'text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-xs transition-colors duration-300 ${
                  isCompleted 
                    ? 'text-green-400' 
                    : isActive 
                      ? 'text-blue-400' 
                      : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QualificationProgress;