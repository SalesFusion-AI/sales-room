import { Play, FileText, Calculator, ExternalLink } from 'lucide-react';

export type ContentCardType = 'video' | 'document' | 'calculator' | 'caseStudy';

export interface ContentCardData {
  id: string;
  type: ContentCardType;
  title: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  url?: string;
}

interface ContentCardProps {
  card: ContentCardData;
  onAction?: (card: ContentCardData) => void;
}

const cardIcons: Record<ContentCardType, typeof Play> = {
  video: Play,
  document: FileText,
  calculator: Calculator,
  caseStudy: FileText,
};

const cardColors: Record<ContentCardType, { bg: string; border: string; icon: string }> = {
  video: {
    bg: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/30',
    icon: 'bg-blue-500/20 text-blue-400',
  },
  document: {
    bg: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/30',
    icon: 'bg-purple-500/20 text-purple-400',
  },
  calculator: {
    bg: 'from-green-500/10 to-green-600/5',
    border: 'border-green-500/30',
    icon: 'bg-green-500/20 text-green-400',
  },
  caseStudy: {
    bg: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/30',
    icon: 'bg-amber-500/20 text-amber-400',
  },
};

export default function ContentCard({ card, onAction }: ContentCardProps) {
  const Icon = cardIcons[card.type];
  const colors = cardColors[card.type];

  return (
    <div
      className={`rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200`}
      onClick={() => onAction?.(card)}
    >
      {/* Video thumbnail area */}
      {card.type === 'video' && (
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center">
          {card.thumbnail ? (
            <img src={card.thumbnail} alt={card.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
          )}
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10 hover:bg-white/30 transition-colors">
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </div>
          {card.duration && (
            <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
              {card.duration}
            </span>
          )}
        </div>
      )}

      {/* Card content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {card.type !== 'video' && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">{card.title}</p>
            <p className="text-xs text-white/50 mt-1 line-clamp-2">{card.description}</p>
            {card.url && (
              <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                {card.type === 'video' ? 'Watch Now' : 'View'} <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Content library - these would come from a CMS/backend in production
export const contentLibrary: ContentCardData[] = [
  {
    id: 'video-pipeline-demo',
    type: 'video',
    title: 'Pipeline Bot: Slack Deal Alerts Demo',
    description: 'See how stale deals get flagged automatically in Slack',
    duration: '2:14',
    url: '#',
  },
  {
    id: 'video-sales-room-demo',
    type: 'video',
    title: 'Sales Room: Live Qualification Demo',
    description: 'Watch AI qualify leads in real-time',
    duration: '3:42',
    url: '#',
  },
  {
    id: 'doc-pricing',
    type: 'document',
    title: 'SalesFusion Pricing Overview',
    description: 'Full breakdown of tiers, features, and ROI calculator',
    url: '#',
  },
  {
    id: 'doc-integration-guide',
    type: 'document',
    title: 'CRM Integration Guide',
    description: 'HubSpot, Salesforce, Pipedrive setup instructions',
    url: '#',
  },
  {
    id: 'calc-roi',
    type: 'calculator',
    title: 'ROI Calculator',
    description: 'Calculate your potential time and revenue savings',
    url: '#',
  },
  {
    id: 'case-techflow',
    type: 'caseStudy',
    title: 'TechFlow: $0 to $5M in 12 Months',
    description: 'How TechFlow automated their entire sales pipeline',
    url: '#',
  },
  {
    id: 'case-bant',
    type: 'caseStudy',
    title: 'Bant.io: $100K in 30 Days',
    description: 'From cold start to first major milestone',
    url: '#',
  },
];

// Helper to match content to conversation context
export function getRelevantContent(messageText: string): ContentCardData[] {
  const lower = messageText.toLowerCase();
  const relevant: ContentCardData[] = [];

  // Keywords to content mapping
  if (/pricing|cost|price|budget|how much|tier/.test(lower)) {
    const pricing = contentLibrary.find(c => c.id === 'doc-pricing');
    if (pricing) relevant.push(pricing);
    const roi = contentLibrary.find(c => c.id === 'calc-roi');
    if (roi) relevant.push(roi);
  }

  if (/pipeline|slack|deal|follow.?up|stale|ghost/.test(lower)) {
    const pipelineDemo = contentLibrary.find(c => c.id === 'video-pipeline-demo');
    if (pipelineDemo) relevant.push(pipelineDemo);
  }

  if (/qualify|qualification|sales room|chat|prospect/.test(lower)) {
    const salesRoomDemo = contentLibrary.find(c => c.id === 'video-sales-room-demo');
    if (salesRoomDemo) relevant.push(salesRoomDemo);
  }

  if (/hubspot|salesforce|pipedrive|crm|integrat/.test(lower)) {
    const integrationGuide = contentLibrary.find(c => c.id === 'doc-integration-guide');
    if (integrationGuide) relevant.push(integrationGuide);
  }

  if (/case study|example|proof|result|success|roi|how.*(work|help)/.test(lower)) {
    const cases = contentLibrary.filter(c => c.type === 'caseStudy');
    relevant.push(...cases.slice(0, 2));
  }

  if (/roi|savings|save|return|worth/.test(lower)) {
    const roi = contentLibrary.find(c => c.id === 'calc-roi');
    if (roi && !relevant.includes(roi)) relevant.push(roi);
  }

  // Limit to 2 cards per message
  return relevant.slice(0, 2);
}
