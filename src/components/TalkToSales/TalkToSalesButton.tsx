import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useQualificationScore } from '../../store/chatStore';
import { getQualificationConfig } from '../../config/qualificationConfig';
import HandoffModal from './HandoffModal';

export default function TalkToSalesButton() {
  const qualificationScore = useQualificationScore();
  const [isOpen, setIsOpen] = useState(false);
  const config = getQualificationConfig();

  // Only show when qualified - but don't display the score to prospects
  if (qualificationScore < config.handoffThreshold) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-[#222] bg-[#111]/90 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur transition hover:border-white/20 hover:bg-[#1a1a1a] animate-fade-in"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
          <MessageSquareText className="h-5 w-5" />
        </span>
        <span className="flex flex-col text-left leading-tight">
          <span>Talk to Sales</span>
          <span className="text-xs text-[var(--text-secondary)]">Ready when you are</span>
        </span>
      </button>

      <HandoffModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
