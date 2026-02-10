import { useState, useEffect } from 'react';
import { MessageSquareText, Sparkles, ArrowRight } from 'lucide-react';
import { useQualificationScore } from '../../store/chatStore';
import HandoffModal from './HandoffModal';

export default function TalkToSalesButton() {
  const qualificationScore = useQualificationScore();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (qualificationScore > 75) {
      // Delayed entrance animation
      setTimeout(() => setIsVisible(true), 500);
      
      // Start pulsing after a few seconds
      setTimeout(() => setIsPulsing(true), 3000);
    } else {
      setIsVisible(false);
      setIsPulsing(false);
    }
  }, [qualificationScore]);

  if (qualificationScore <= 75) return null;

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-40 transition-all duration-700 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-95'
      }`}>
        <button
          onClick={() => setIsOpen(true)}
          className={`group relative flex items-center gap-3 rounded-full glass-panel border border-white/20 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-white/30 ${
            isPulsing ? 'animate-pulse' : ''
          }`}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-xl -z-10 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all duration-300" />
          
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] via-[#0A84FF] to-[#5AC8FA] text-white shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <MessageSquareText className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <Sparkles className="absolute top-1 right-1 h-2 w-2 text-white opacity-75 animate-ping" />
          </span>
          
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-semibold">Talk to Sales</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">{qualificationScore}% qualified</span>
            </div>
          </div>
          
          {/* Subtle border animation */}
          <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-white/20 transition-colors duration-300" />
        </button>
      </div>

      <HandoffModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
