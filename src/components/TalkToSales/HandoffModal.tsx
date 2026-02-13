import { useMemo, useState } from 'react';
import { X, PhoneCall, Calendar, UserCheck } from 'lucide-react';
import { useChatStore, useQualificationScore } from '../../store/chatStore';
import { notifyHandoffReady } from '../../services/slackService';

type RepStatus = 'available' | 'busy' | 'offline';

interface HandoffModalProps {
  open: boolean;
  onClose: () => void;
}

const statusStyles: Record<RepStatus, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-white/15 text-white border-white/30',
  },
  busy: {
    label: 'Busy',
    className: 'bg-white/10 text-white/80 border-white/20',
  },
  offline: {
    label: 'Offline',
    className: 'bg-[#111] text-gray-400 border-[#222]',
  },
};

export default function HandoffModal({ open, onClose }: HandoffModalProps) {
  const [status, setStatus] = useState<RepStatus>('available');
  const [calendlyLink, setCalendlyLink] = useState('https://calendly.com/salesfusion');
  const [connecting, setConnecting] = useState(false);
  const prospectInfo = useChatStore(s => s.prospectInfo);
  const qualificationScore = useQualificationScore();

  const showSchedule = status !== 'available';
  const statusBadge = useMemo(() => statusStyles[status], [status]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-3xl border border-[#222] bg-[#0b0b0b]/95 backdrop-blur-[24px] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#222] px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white font-display">Talk to Sales</h2>
              <p className="text-sm text-gray-400">Connect with a live sales rep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[#222] bg-[#111] p-2 text-gray-400 hover:text-white hover:border-white/20 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Rep availability</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
                <span className="text-xs text-gray-500">Sales team (EST)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Status:</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as RepStatus)}
                className="rounded-full border border-[#222] bg-[#111] px-3 py-1 text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/10"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {!showSchedule && (
            <div className="rounded-2xl border border-[#222] bg-[#111] p-5">
              <p className="text-sm text-gray-300">A rep is ready to jump in right now.</p>
              <button 
                onClick={async () => {
                  setConnecting(true);
                  // Notify sales team via Slack
                  await notifyHandoffReady(
                    prospectInfo.name,
                    prospectInfo.company,
                    prospectInfo.email,
                    qualificationScore
                  );
                  // In production, this would initiate a real connection
                  // For now, show confirmation
                  setTimeout(() => {
                    setConnecting(false);
                    alert('A sales rep has been notified and will connect shortly!');
                  }, 1000);
                }}
                disabled={connecting}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-[#f5f5f5] disabled:opacity-50"
              >
                <PhoneCall className="h-4 w-4" />
                {connecting ? 'Connecting...' : 'Connect Now'}
              </button>
            </div>
          )}

          {showSchedule && (
            <div className="rounded-2xl border border-[#222] bg-[#111] p-5 space-y-4">
              <div>
                <p className="text-sm text-gray-300">No reps free right now. Lock in a time that works.</p>
                <p className="text-xs text-gray-500">Drop in your Calendly link or use the embed below.</p>
              </div>

              <label className="space-y-2 text-sm text-gray-400">
                Calendly link
                <input
                  type="url"
                  value={calendlyLink}
                  onChange={(event) => setCalendlyLink(event.target.value)}
                  placeholder="https://calendly.com/salesfusion"
                  className="w-full rounded-2xl border border-[#222] bg-[#111] px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </label>

              {calendlyLink && (
                <div className="overflow-hidden rounded-2xl border border-[#222]">
                  <iframe
                    title="Schedule a Call"
                    src={calendlyLink}
                    className="h-64 w-full bg-[#111]"
                  />
                </div>
              )}

              <a
                href={calendlyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#222] bg-[#111] px-4 py-2 text-sm text-gray-200 transition hover:border-white/20 hover:text-white"
              >
                <Calendar className="h-4 w-4" />
                Schedule a Call
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
